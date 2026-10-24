import { describe, expect, it } from 'vitest'
import { rawData } from '../data/raw'
import { AXIS_IDS, type Question, type Wording } from '../data/schemas'
import { parseGameData } from '../data/validate'
import { CONFIG } from './config'
import { getContext } from './context'
import { explainBuild } from './explain'
import { exclusionReason } from './filters'
import { buildProfile } from './profile'
import { rank } from './rank'
import { rankRaces } from './races'
import { fitCurve, noveltyFit, tagFit, toMatch } from './score'
import type { Answers, Setup } from './types'

const data = parseGameData(rawData)
const ctx = getContext(data)
const build = (id: string) => {
  const b = ctx.builds.get(id)
  if (!b) throw new Error(`no build ${id}`)
  return b
}
const setup = (over: Partial<Setup> = {}): Setup => ({ experience: 'played', faction: 'any', ruleset: 'normal', skyborne: 'no', ...over })
const answers = (picks: Answers['picks'] = {}, over: Partial<Setup> = {}): Answers => ({ setup: setup(over), picks })

describe('fit curve and calibration', () => {
  it('maps distance to fit', () => {
    expect(fitCurve(0)).toBe(1)
    expect(fitCurve(5)).toBe(0)
    expect(fitCurve(1)).toBeCloseTo(0.911, 3)
    expect(fitCurve(2)).toBeGreaterThan(fitCurve(3))
    expect(fitCurve(-1)).toBe(1)
  })

  it('is monotonic and clamped', () => {
    expect(toMatch(0)).toBe(5)
    expect(toMatch(1)).toBe(97)
    expect(toMatch(0.9)).toBeGreaterThan(toMatch(0.8))
    expect(toMatch(CONFIG.calibration.s0)).toBe(50)
  })
})

describe('profile', () => {
  it('turns priorities into rank-weighted axis targets', () => {
    const p = buildProfile(answers({ 'two-hours': ['big-team', 'own-pace', 'fortune'] }), ctx)
    expect(p.priorities).toEqual(['raid', 'soloLeveling', 'goldFarming'])
    expect(p.axes.raid).toEqual({ target: 4, weight: 3 * 0.7 })
    expect(p.axes.soloLeveling.weight).toBe(2)
    expect(p.axes.goldFarming.weight).toBe(1.2)
  })

  it('Hardcore raises survival and solo leveling', () => {
    const p = buildProfile(answers({ festival: 'overview' }, { ruleset: 'hardcore' }), ctx)
    expect(p.axes.survivability.target).toBe(4)
    expect(p.axes.survivability.weight).toBeCloseTo(0.1 + 2)
    expect(p.axes.soloLeveling.target).toBe(4)
  })

  it('newcomers get low complexity unless they asked for complexity', () => {
    expect(buildProfile(answers({}, { experience: 'new' }), ctx).axes.complexity).toEqual({ target: 2, weight: 1 })
    const complex = buildProfile(answers({ stuck: 'look-it-up' }, { experience: 'new' }), ctx)
    expect(complex.flags).toContain('wantsComplexity')
    expect(complex.axes.complexity.target).toBe(4.25)
  })

  it('adds up and clamps tag affinities, and scales tag weight', () => {
    const p = buildProfile(answers({ wins: 'outsmart', feeling: 'edge' }), ctx)
    expect(p.tags.trickster).toBeCloseTo(0.7)
    expect(p.tagWeight).toBeGreaterThan(0)
    expect(buildProfile(answers(), ctx).tagWeight).toBe(0)
    // Real answers stay far below the ±3 clamp, so check it on a made-up loud question.
    const wording = { newcomer: 'x', veteran: 'x' }
    const loud: Question = {
      id: 'loud', type: 'multi', text: wording, exclusive: [],
      options: ['a', 'b'].map((id) => ({ id, label: wording, effects: { tags: { trickster: 2 } } })),
    }
    const loudCtx = getContext({ ...data, questions: { ...data.questions, questions: [...data.questions.questions, loud] } })
    expect(buildProfile(answers({ loud: ['a', 'b'] }), loudCtx).tags.trickster).toBe(3)
  })

  it('applies tweak multipliers', () => {
    const base = buildProfile(answers({ annoyance: 'waiting' }), ctx)
    const tweaked = buildProfile({ ...answers({ annoyance: 'waiting' }), tweaks: { sustain: 6 } }, ctx)
    expect(tweaked.axes.sustain.weight).toBe(base.axes.sustain.weight * 2)
  })
})

describe('scoring pieces', () => {
  it('tag fit is 0.5 without preferences and higher for matching fantasy', () => {
    const neutral = buildProfile(answers(), ctx)
    expect(tagFit(build('priest-shadow'), neutral)).toBe(0.5)
    const edgy = buildProfile(answers({ feeling: 'edge' }), ctx)
    // cosine({shadow .2, trickster .2, fire .1, berserker .1}, {shadow 3}) = 0.632 → fit 0.816
    expect(tagFit(build('priest-shadow'), edgy)).toBeCloseTo(0.816, 3)
    expect(tagFit(build('paladin-holy'), edgy)).toBe(0.5)
  })

  it('novelty saturates at 2: every big rework counts as equally new', () => {
    const reworks = data.builds.filter((b) => b.novelty >= 2)
    expect(reworks.some((b) => b.novelty === 3)).toBe(true)
    expect(new Set(reworks.map((b) => noveltyFit(b, 2))).size).toBe(1)
    const small = data.builds.find((b) => b.novelty === 1)!
    expect(noveltyFit(small, 2)).toBeLessThan(noveltyFit(reworks[0]!, 2))
  })
})

describe('hard filters', () => {
  const profile = (filters: string[]) => buildProfile(answers({ preferences: filters }), ctx)

  it('"no pets" drops pet-required builds but keeps optional-pet ones', () => {
    const p = profile(['no-pets'])
    expect(exclusionReason(build('hunter-beast-mastery'), p, ctx)).toBe('noPets')
    expect(exclusionReason(build('hunter-marksmanship'), p, ctx)).toBeNull()
    expect(exclusionReason(build('warlock-destruction'), p, ctx)).toBeNull()
  })

  it('"must heal/tank" is class-level (dual spec covers it)', () => {
    const heal = profile(['must-heal'])
    expect(exclusionReason(build('priest-shadow'), heal, ctx)).toBeNull()
    expect(exclusionReason(build('warrior-fury'), heal, ctx)).toBe('mustHeal')
    const tank = profile(['must-tank'])
    expect(exclusionReason(build('druid-balance'), tank, ctx)).toBeNull()
    expect(exclusionReason(build('shaman-enhancement'), tank, ctx)).toBe('mustTank')
  })

  it('range filters use the range axis', () => {
    expect(exclusionReason(build('hunter-survival'), profile(['ranged-only']), ctx)).toBe('rangedOnly')
    expect(exclusionReason(build('paladin-holy'), profile(['melee-only']), ctx)).toBe('meleeOnly')
  })

  it('"no stealth" drops rogues but not cat druids', () => {
    const p = profile(['no-stealth'])
    expect(exclusionReason(build('rogue-combat'), p, ctx)).toBe('noStealth')
    expect(exclusionReason(build('druid-feral-cat'), p, ctx)).toBeNull()
  })

  it('"no healing" and "no tanking" are build-level: the class stays, its healer or tank specs go', () => {
    const noHeal = profile(['no-healing'])
    expect(exclusionReason(build('priest-holy'), noHeal, ctx)).toBe('noHeal')
    expect(exclusionReason(build('priest-shadow'), noHeal, ctx)).toBeNull()
    const noTank = profile(['no-tanking'])
    expect(exclusionReason(build('warrior-protection'), noTank, ctx)).toBe('noTank')
    expect(exclusionReason(build('warrior-arms'), noTank, ctx)).toBeNull()
    // Enhancement can off-tank small groups, but it's a damage spec.
    expect(exclusionReason(build('shaman-enhancement'), noTank, ctx)).toBeNull()
  })

  it('"no healing" beats "must heal" (only a hand-made link can send both)', () => {
    expect(profile(['must-heal', 'no-healing']).filters).toEqual(['noHeal'])
    expect(profile(['must-tank', 'no-tanking']).filters).toEqual(['noTank'])
  })

  it('skipped classes are ruled out, with a reason', () => {
    const res = rank(answers({ 'skip-classes': ['paladin', 'druid'] }), data)
    expect(res.results.some((r) => ['paladin', 'druid'].includes(build(r.buildId).classId))).toBe(false)
    expect(res.excluded.map((e) => e.reason)).toEqual(Array(7).fill('skippedClass'))
    const skippedPopular = res.whyNot.filter((w) => w.rank === null)
    for (const w of skippedPopular) expect(w.reason).toEqual(data.explanations.skippedClass)
  })
})

describe('races', () => {
  const racesFor = (id: string, over: Partial<Setup>) => rankRaces(build(id), buildProfile(answers({}, over), ctx), ctx)

  it('Horde paladins are Undead only; Alliance shamans are Dwarves only', () => {
    expect(racesFor('paladin-holy', { faction: 'horde', skyborne: 'yes' }).map((r) => r.raceId)).toEqual(['undead'])
    expect(racesFor('shaman-elemental', { faction: 'alliance', skyborne: 'yes' }).map((r) => r.raceId)).toEqual(['dwarf'])
  })

  it('Skyborne needs the pack; "not sure" shows it with a badge and a penalty', () => {
    const ids = (over: Partial<Setup>) => racesFor('mage-frost', over).map((r) => r.raceId)
    expect(ids({ faction: 'alliance', skyborne: 'no' })).not.toContain('skyborne-high-order')
    expect(ids({ faction: 'alliance', skyborne: 'yes' })).toContain('skyborne-high-order')
    const yes = racesFor('mage-frost', { faction: 'alliance', skyborne: 'yes' }).find((r) => r.raceId === 'skyborne-high-order')
    const unsure = racesFor('mage-frost', { faction: 'alliance', skyborne: 'unsure' }).find((r) => r.raceId === 'skyborne-high-order')
    expect(yes?.needsPack).toBe(false)
    expect(unsure?.needsPack).toBe(true)
    expect((yes?.score ?? 0) - (unsure?.score ?? 0)).toBeCloseTo(1)
  })

  it('a look answer still moves races (no question feeds it since the place to live left the quiz, D47)', () => {
    const wording = { newcomer: 'x', veteran: 'x' }
    const place: Question = {
      id: 'place', type: 'pickOne', text: wording,
      options: [
        { id: 'forest', label: wording, effects: { aesthetic: { elven: 3 } } },
        { id: 'ruins', label: wording, effects: { aesthetic: { eerie: 3 } } },
      ],
    }
    const placeCtx = getContext({ ...data, questions: { ...data.questions, questions: [...data.questions.questions, place] } })
    const racesBy = (pick: string) => rankRaces(build('priest-holy'), buildProfile(answers({ place: pick }), placeCtx), placeCtx)
    expect(racesBy('forest')[0]?.raceId).toBe('night-elf')
    expect(racesBy('ruins')[0]?.raceId).toBe('undead')
  })

  it('a race in mind leads every card it can play, and is flagged as the pick', () => {
    const res = rank(answers({ race: 'tauren' }), data)
    expect(res.profile.race).toBe('tauren')
    expect(new Set(res.results.map((r) => build(r.buildId).classId))).toEqual(new Set(['druid', 'hunter', 'shaman', 'warrior']))
    for (const r of res.results) expect(r.races[0]).toMatchObject({ raceId: 'tauren', chosen: true })
    expect(res.excluded.every((e) => e.reason === 'wrongRace')).toBe(true)
  })

  it('ignores a race the setup cannot make, so the racials decide', () => {
    expect(rank(answers({ race: 'tauren' }, { faction: 'alliance' }), data).profile.race).toBeNull()
    expect(rank(answers({ race: 'skyborne-windshaper' }, { skyborne: 'no' }), data).profile.race).toBeNull()
    const unsure = rank(answers({ race: 'skyborne-windshaper' }, { skyborne: 'unsure' }), data)
    expect(unsure.results[0]?.races[0]).toMatchObject({ raceId: 'skyborne-windshaper', chosen: true, needsPack: true })
  })
})

describe('explanations', () => {
  const armorText = (buildId: string, packing: string) =>
    rank(answers({ packing }), data).results.find((r) => r.buildId === buildId)?.reasons.find((x) => x.source === 'armor')?.text
  const armor = ctx.axes.get('armor')!

  // Reported on Reddit: a "practical" packer got Restoration Druid with "Heavy armor, as requested."
  it('armor reasons follow the build, not the answer', () => {
    expect(armorText('druid-restoration', 'practical')).toEqual(armor.texts.midFit)
    expect(armorText('warrior-arms', 'sturdy')).toEqual(armor.texts.highFit)
    expect(armorText('mage-frost', 'light')).toEqual(armor.texts.lowFit)
  })

  it('never claims the player asked for something the quiz only inferred', () => {
    const roles = rank(answers({ 'group-project': 'nobody-behind', festival: 'front-row', packing: 'sturdy' }), data)
    // Themes come from moods and scenarios, never from a fantasy pick (D30).
    const themes = rank(answers({ feeling: 'calm', wins: 'outsmart', stuck: 'look-it-up' }), data)
    expect(themes.results.some((r) => r.reasons.some((x) => x.source === 'tags'))).toBe(true)
    const texts = [roles, themes].flatMap((res) => res.results.flatMap((r) => [...r.reasons, ...r.watchOuts]))
    for (const { text } of texts) expect(text.veteran + text.newcomer).not.toMatch(/as requested|you picked|asked for|your pick/i)
  })

  // Reported on Reddit: "Excellent BG healer with forms" for a player whose last priority is PvP.
  const strengthAxes = (buildId: string, text: Wording) =>
    build(buildId).strengths.find((s) => s.text.newcomer === text.newcomer)?.axes ?? []
  const reasonAxes = (res: ReturnType<typeof rank>) => res.results.flatMap((r) => r.reasons.flatMap((x) => strengthAxes(r.buildId, x.text)))
  const pve: Answers['picks'] = {
    'two-hours': ['few-friends', 'own-pace', 'big-team'], 'group-project': 'nobody-behind', festival: 'backstage', feeling: 'calm',
  }

  it('never sells battlegrounds to a player with no PvP priority who turned battlegrounds down', () => {
    const res = rank({ ...answers(pve), tweaks: { battlegrounds: 2 } }, data)
    expect(reasonAxes(res)).not.toContain('battlegrounds')
  })

  it('skips PvP strengths when no answer points to PvP, but a dungeon player who skipped raids keeps group strengths', () => {
    const res = rank(answers({ ...pve, 'two-hours': ['few-friends', 'own-pace'] }), data)
    const axes = reasonAxes(res)
    expect(axes).not.toContain('battlegrounds')
    expect(axes).not.toContain('worldPvp')
    expect(axes).toContain('raid') // e.g. "A healer every group wants" leans on dungeon and raid
  })

  it('falls back to the pitch when nothing honest is left to say', () => {
    const profile = { ...buildProfile(answers(), ctx), turnedDown: [...AXIS_IDS] }
    const b = build('warlock-destruction')
    expect(explainBuild(b, [], profile, ctx).reasons).toEqual([{ source: 'pitch', text: b.pitch }])
  })
})

describe('rank', () => {
  it('forces a healing dual spec when the main build cannot heal', () => {
    const res = rank(answers({ festival: 'overview', feeling: 'edge', preferences: ['must-heal'] }), data)
    for (const r of res.results) {
      const main = build(r.buildId)
      if (main.role !== 'healer') expect(build(r.dualSpec?.buildId ?? '').role).toBe('healer')
    }
  })

  it('keeps every build ranked when there are no answers', () => {
    const res = rank(answers(), data)
    expect(res.results).toHaveLength(28)
    expect(new Set(res.results.map((r) => r.match)).size).toBe(1)
  })

  it('reports when hard preferences leave nothing', () => {
    const res = rank(answers({ preferences: ['must-tank', 'ranged-only', 'no-stealth', 'must-heal'] }), data)
    // Druid survives: Balance is ranged, the class can heal and tank via dual spec.
    expect(res.results.map((r) => r.buildId)).toContain('druid-balance')
    const none = rank(answers({ preferences: ['ranged-only', 'melee-only'] }), data)
    expect(none.results).toHaveLength(0)
    expect(none.notes).toEqual([data.explanations.notes.nothingLeft])
    // A race in mind plus skipping every class it can play leaves nothing either.
    const skipAll = rank(answers({ race: 'tauren', 'skip-classes': ['druid', 'hunter', 'shaman', 'warrior'] }), data)
    expect(skipAll.results).toHaveLength(0)
    expect(skipAll.notes).toEqual([data.explanations.notes.nothingLeft])
  })

  // Reported on Reddit: one caring answer among damage-dealer answers made the #1 a healer (D48).
  it('one caring answer no longer turns a damage dealer into a healer', () => {
    const caringDps = answers({
      'two-hours': ['few-friends', 'fair-match', 'own-pace'], 'group-project': 'nobody-behind', 'team-sport': 'scorer',
      annoyance: 'not-mattering', wins: 'big-moment', stuck: 'ask-friends', festival: 'overview', packing: 'practical',
      feeling: 'counted-on', restaurant: 'something-new', patience: 'annoying',
    })
    const top3 = rank(caringDps, data).results.slice(0, 3).map((r) => build(r.buildId).role)
    expect(top3[0]).toBe('dps')
    expect(top3.filter((role) => role === 'dps').length).toBeGreaterThanOrEqual(2)
  })

  it('never offers a ruled-out role, not even as the dual spec', () => {
    const res = rank(answers({ 'team-sport': 'playmaker', festival: 'backstage', preferences: ['no-healing', 'no-tanking'] }), data)
    expect(res.results.length).toBeGreaterThan(0)
    for (const r of res.results) {
      expect(build(r.buildId).role).toBe('dps')
      if (r.dualSpec) expect(build(r.dualSpec.buildId).role).toBe('dps')
      // "Hybrid class, flexible roles" would sell the roles they ruled out.
      expect(r.reasons.map((x) => x.text)).not.toContainEqual(data.explanations.hybrid)
    }
    // Shadow's only partners are healers, so it has no second spec to suggest.
    expect(res.results.find((r) => r.buildId === 'priest-shadow')?.dualSpec).toBeNull()
  })
})
