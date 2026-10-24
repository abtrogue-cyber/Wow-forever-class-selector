import {
  AXIS_IDS, CLASS_IDS, FACTIONS, GameDataSchema, HARD_FILTERS, ROLE_TAGS, SETUP_FIELDS, SETUP_OPTIONS, TAG_IDS,
  type GameData,
} from './schemas'

/** Parses with Zod, then runs the cross-reference checks. Throws with every problem listed. */
export function parseGameData(raw: unknown): GameData {
  const data = GameDataSchema.parse(raw)
  const problems = findDataProblems(data)
  if (problems.length > 0) throw new Error(`Invalid game data:\n- ${problems.join('\n- ')}`)
  return data
}

/** Checks that schemas alone can't express: references, coverage, consistency. */
export function findDataProblems(d: GameData): string[] {
  const problems: string[] = []
  const fail = (msg: string) => problems.push(msg)

  const duplicates = (label: string, ids: string[]) => {
    const seen = new Set<string>()
    for (const id of ids) {
      if (seen.has(id)) fail(`${label}: duplicate id "${id}"`)
      seen.add(id)
    }
  }
  const sameSet = (label: string, actual: readonly string[], expected: readonly string[]) => {
    const missing = expected.filter((id) => !actual.includes(id))
    const extra = actual.filter((id) => !expected.includes(id))
    if (missing.length || extra.length) fail(`${label}: missing [${missing}] extra [${extra}]`)
  }

  // Vocabularies described in JSON must match the typed id lists exactly.
  sameSet('axes.json', d.axes.map((a) => a.id), AXIS_IDS)
  sameSet('tags.json', d.tags.map((t) => t.id), TAG_IDS)
  sameSet('classes.json', d.classes.map((c) => c.id), CLASS_IDS)
  for (const axis of d.axes) {
    if (axis.mode === 'closeness' && (!axis.texts.lowFit || !axis.texts.highWatch)) {
      fail(`axis ${axis.id}: closeness axes need lowFit and highWatch texts`)
    }
  }

  // Sources
  duplicates('sources', d.sources.map((s) => s.id))
  const sourceIds = new Set(d.sources.map((s) => s.id))
  const checkSources = (label: string, refs: string[]) => {
    for (const ref of refs) if (!sourceIds.has(ref)) fail(`${label}: unknown source "${ref}"`)
  }
  for (const s of d.sources) if (s.kind !== 'editorial' && !s.url) fail(`source ${s.id}: needs a url`)

  // Classes
  const classes = new Map(d.classes.map((c) => [c.id, c]))
  for (const c of d.classes) checkSources(`class ${c.id}`, c.sources)

  // Builds
  duplicates('builds', d.builds.map((b) => b.id))
  const buildIds = new Map(d.builds.map((b) => [b.id, b]))
  for (const b of d.builds) {
    const label = `build ${b.id}`
    checkSources(label, b.sources)
    const cls = classes.get(b.classId)
    if (cls && !cls.roles.includes(b.role)) fail(`${label}: role ${b.role} not in ${b.classId} roles`)
    for (const partner of b.dualSpecPartners) {
      const p = buildIds.get(partner)
      if (!p) fail(`${label}: unknown dual-spec partner "${partner}"`)
      else if (p.classId !== b.classId) fail(`${label}: dual-spec partner ${partner} is another class`)
      else if (p.id === b.id) fail(`${label}: lists itself as dual-spec partner`)
    }
    duplicates(`${label} lowConfidenceAxes`, b.lowConfidenceAxes)
    if (b.petStyle === 'none' && b.axes.petReliance !== 0) fail(`${label}: petStyle none but petReliance > 0`)
    if (b.petStyle === 'required' && b.axes.petReliance < 3) fail(`${label}: petStyle required but petReliance < 3`)
    if (b.stealth >= 2 && !b.tags.stealth) fail(`${label}: stealth build without the stealth tag`)
    if (Object.keys(b.tags).length === 0) fail(`${label}: needs at least one tag`)
  }
  for (const c of d.classes) {
    for (const role of c.roles) {
      if (!d.builds.some((b) => b.classId === c.id && b.role === role)) fail(`class ${c.id}: no build for role ${role}`)
    }
  }
  const popular = d.builds.filter((b) => b.popular).length
  if (popular < 6 || popular > 12) fail(`builds: ${popular} popular builds (expected 6–12)`)

  // Races
  duplicates('races', d.races.map((r) => r.id))
  const races = new Map(d.races.map((r) => [r.id, r]))
  for (const r of d.races) {
    const label = `race ${r.id}`
    checkSources(label, r.sources)
    duplicates(`${label} racials`, r.racials.map((x) => x.id))
    const actives = r.racials.filter((x) => x.type === 'active').length
    if (actives !== 2) fail(`${label}: expected 2 active + 2 passive racials, got ${actives} active`)
    if (Object.keys(r.aesthetic).length === 0) fail(`${label}: needs an aesthetic`)
  }

  // Race/class matrix
  checkSources('raceClass', d.raceClass.sources)
  duplicates('raceClass combos', d.raceClass.combos.map((c) => `${c.raceId}/${c.classId}`))
  for (const combo of d.raceClass.combos) {
    if (!races.has(combo.raceId)) fail(`raceClass: unknown race ${combo.raceId}`)
    const race = races.get(combo.raceId)
    if (race?.group === 'skyborne' && !combo.newInForever) fail(`raceClass: Skyborne combo ${combo.classId} must be new`)
  }
  for (const r of d.races) {
    if (!d.raceClass.combos.some((c) => c.raceId === r.id)) fail(`race ${r.id}: no classes in the matrix`)
    for (const cls of Object.keys(r.classSpells ?? {})) {
      if (!d.raceClass.combos.some((c) => c.raceId === r.id && c.classId === cls)) {
        fail(`race ${r.id}: has ${cls} spells but can't be a ${cls}`)
      }
    }
  }
  // Forever promise: every class is playable on both factions without buying Skyborne.
  for (const cls of CLASS_IDS) {
    for (const faction of FACTIONS) {
      const ok = d.raceClass.combos.some((c) => {
        const race = races.get(c.raceId)
        return c.classId === cls && race && !race.requiresPurchase && race.factions.includes(faction)
      })
      if (!ok) fail(`raceClass: no ${faction} race for ${cls} without a purchase`)
    }
  }

  // Questions
  const setupIds = d.questions.setup.map((s) => s.id)
  sameSet('questions.setup', setupIds, SETUP_FIELDS)
  for (const field of d.questions.setup) {
    sameSet(`setup ${field.id} options`, field.options.map((o) => o.id), SETUP_OPTIONS[field.id])
  }
  duplicates('questions', d.questions.questions.map((q) => q.id))
  if (d.questions.questions[0]?.withPrevious) fail('questions: the first question has no screen to share')
  // Only the direct questions (tick boxes, a race, classes to skip) can share a screen.
  d.questions.questions.forEach((q, i) => {
    const shared = q.withPrevious || d.questions.questions[i + 1]?.withPrevious
    if (shared && q.type !== 'multi' && q.type !== 'race' && q.type !== 'skipClasses') fail(`question ${q.id}: a ${q.type} question can't share a screen`)
  })
  const fedAxes = new Set<string>()
  const setFilters = new Set<string>()
  const moreIsFine = new Set<string>(d.axes.filter((a) => a.mode === 'atLeast').map((a) => a.id))
  const roleTags = new Set<string>(Object.values(ROLE_TAGS))
  for (const q of d.questions.questions) {
    duplicates(`question ${q.id} options`, q.options.map((o) => o.id))
    if (q.type === 'thisOrThat' && q.options.length !== 2) fail(`question ${q.id}: this-or-that needs exactly 2 options`)
    if (q.type === 'priorities') {
      duplicates(`question ${q.id} axes`, q.options.map((o) => o.axis))
      for (const o of q.options) {
        fedAxes.add(o.axis)
        if (!d.explanations.dualSpec.priority[o.axis]) fail(`explanations.dualSpec.priority: missing ${o.axis}`)
      }
    } else if (q.type === 'race' || q.type === 'skipClasses') {
      // Options are the races or classes themselves, named as in their own files.
      const names = new Map<string, string>(q.type === 'race' ? d.races.map((r) => [r.id, r.name]) : d.classes.map((c) => [c.id, c.name]))
      sameSet(`question ${q.id} options`, q.options.map((o) => o.id), [...names.keys()])
      for (const o of q.options) {
        if (names.has(o.id) && o.label.newcomer !== names.get(o.id)) fail(`question ${q.id}: ${o.id} should be labelled ${names.get(o.id)}`)
      }
    } else {
      for (const o of q.options) {
        for (const [axis, wish] of Object.entries(o.effects.axes ?? {})) {
          fedAxes.add(axis)
          // An indirect answer asks for "good at it" at most; only the priorities question may ask for more (D31, D48).
          if (moreIsFine.has(axis) && wish.target > 4) fail(`question ${q.id}: ${o.id} asks for ${axis} ${wish.target} (at most 4)`)
        }
        for (const tag of Object.keys(o.effects.tags ?? {})) {
          if (roleTags.has(tag)) fail(`question ${q.id}: ${o.id} sets the ${tag} tag, which restates a role (use roles)`)
        }
        o.effects.filters?.forEach((f) => setFilters.add(f))
      }
    }
    if (q.type === 'multi') {
      for (const pair of q.exclusive) {
        for (const id of pair) if (!q.options.some((o) => o.id === id)) fail(`question ${q.id}: exclusive id ${id} unknown`)
      }
    }
  }
  // Every axis must be reachable from at least one answer (otherwise it can never matter), and so must every filter.
  for (const axis of AXIS_IDS) if (!fedAxes.has(axis)) fail(`axis ${axis}: no question feeds it`)
  for (const filter of HARD_FILTERS) if (!setFilters.has(filter)) fail(`filter ${filter}: no answer sets it`)

  return problems
}
