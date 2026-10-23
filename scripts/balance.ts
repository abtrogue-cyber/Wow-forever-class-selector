// Generates docs/BALANCE.md: how the quiz spreads #1 results over roles and classes, which answers move the #1 build,
// and which score components make each class win or lose. Run: npm run balance   (add --print for the headline numbers)
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { quizScreens } from '../src/components/quiz/screens'
import { rawData } from '../src/data/raw'
import { AXIS_IDS, CLASS_IDS, ROLES, type Build, type ClassId, type Role } from '../src/data/schemas'
import { parseGameData } from '../src/data/validate'
import { ENGINE_VERSION } from '../src/engine/config'
import { getContext } from '../src/engine/context'
import { withRelativeContributions } from '../src/engine/explain'
import { exclusionReason } from '../src/engine/filters'
import { CLASS_FANS, PERSONAS } from '../src/engine/personas'
import { buildProfile } from '../src/engine/profile'
import { rank } from '../src/engine/rank'
import { componentFits, weightedScore } from '../src/engine/score'
import { randomAnswers } from '../src/engine/testUtils'
import type { Answers, Component, ComponentId } from '../src/engine/types'

const PLAYERS = 2000
/** Proposed targets (Reddit round, phase C). */
const TARGETS = { classMin: 0.05, classMax: 0.2, tankMax: 0.18, healerMax: 0.22, flipMax: 0.4 }

const data = parseGameData(rawData)
const ctx = getContext(data)
const builds = new Map(data.builds.map((b) => [b.id, b]))
const className = (id: ClassId) => ctx.classes.get(id)?.name ?? id
const buildName = (id: string) => builds.get(id)?.name ?? id
const pct = (x: number) => `${(100 * x).toFixed(1)}%`
const pts = (x: number) => (100 * x).toFixed(1)

// ——— Players ———————————————————————————————————————————————————————————————————————————————————————————

/** The direct questions on the last screen (hard preferences, a race in mind, classes to skip). */
const DIRECT = new Set(quizScreens(data.questions.questions).at(-1)?.map((q) => q.id))
const QUIZ = data.questions.questions.filter((q) => !DIRECT.has(q.id))

/** Random quiz answers (testUtils) without the last screen and without result-page tweaks: the questions alone. */
function player(seed: number): Answers {
  const { setup, picks } = randomAnswers(seed, data)
  return { setup, picks: Object.fromEntries(Object.entries(picks).filter(([id]) => !DIRECT.has(id))) }
}

const withPick = (a: Answers, id: string, pick: string | string[] | undefined): Answers => {
  const picks = { ...a.picks }
  if (pick === undefined) delete picks[id]
  else picks[id] = pick
  return { ...a, picks }
}

// ——— Scoring (same scores and tie-break as rank(), without explanations, races or dual spec) ——————————————

const round9 = (x: number) => Math.round(x * 1e9) / 1e9
type Scored = { build: Build; score: number; components: Component[] }

function scored(answers: Answers, withRel = false): Scored[] {
  const profile = buildProfile(answers, ctx)
  const eligible = data.builds.flatMap((build, order) =>
    exclusionReason(build, profile, ctx) ? [] : [{ build, order, raw: componentFits(build, profile, ctx) }],
  )
  const rel = withRel ? withRelativeContributions(eligible.map((e) => e.raw)) : []
  return eligible
    .map((e, i) => ({ build: e.build, order: e.order, score: weightedScore(e.raw), components: rel[i] ?? [] }))
    .sort((a, b) => round9(b.score) - round9(a.score) || a.order - b.order)
}
const top = (answers: Answers) => scored(answers)[0]!.build

const players = Array.from({ length: PLAYERS }, (_, i) => player(i + 1))
players.slice(0, 200).forEach((a, i) => {
  if (top(a).id !== rank(a, data).results[0]?.buildId) throw new Error(`balance scoring disagrees with rank() for player ${i + 1}`)
})
const tops = players.map(top)

// ——— Shares ——————————————————————————————————————————————————————————————————————————————————————————

const share = <K extends string>(keys: readonly K[], of: (b: Build) => K, list: Build[]) =>
  Object.fromEntries(keys.map((k) => [k, list.filter((b) => of(b) === k).length / list.length])) as Record<K, number>
const roleTop = share(ROLES, (b) => b.role, tops)
const roleBuilds = share(ROLES, (b) => b.role, data.builds)
const classTop = share(CLASS_IDS, (b) => b.classId, tops)
const classBuilds = share(CLASS_IDS, (b) => b.classId, data.builds)
const classTop3 = Object.fromEntries(CLASS_IDS.map((c) => [c, 0])) as Record<ClassId, number>
for (const a of players) {
  for (const c of new Set(scored(a).slice(0, 3).map((s) => s.build.classId))) classTop3[c] += 1 / PLAYERS
}
const buildTop = data.builds.map((b) => ({ b, n: tops.filter((t) => t.id === b.id).length / PLAYERS }))

// ——— What each answer does to the #1 build ————————————————————————————————————————————————————————————

type OptionRow = { question: string; option: string; flips: number; roles: Record<Role, number>; gain: { cls: ClassId; delta: number } }
const optionRows: OptionRow[] = []
for (const q of QUIZ) {
  const skipped = players.map((a) => top(withPick(a, q.id, undefined)))
  const skippedClass = share(CLASS_IDS, (b) => b.classId, skipped)
  for (const o of q.options) {
    const chosen = players.map((a) => top(withPick(a, q.id, q.type === 'priorities' ? [o.id] : o.id)))
    const chosenClass = share(CLASS_IDS, (b) => b.classId, chosen)
    const gainCls = [...CLASS_IDS].sort((x, y) => chosenClass[y] - skippedClass[y] - (chosenClass[x] - skippedClass[x]))[0]!
    optionRows.push({
      question: q.id,
      option: o.id,
      flips: chosen.filter((b, i) => b.id !== skipped[i]!.id).length / PLAYERS,
      roles: share(ROLES, (b) => b.role, chosen),
      gain: { cls: gainCls, delta: chosenClass[gainCls] - skippedClass[gainCls] },
    })
  }
}

// ——— Why classes win or lose: score components (rel = share of the score versus the average build) —————————————

const COMPONENTS: ComponentId[] = [...AXIS_IDS, 'role', 'tags', 'novelty']
const zeros = () => Object.fromEntries(COMPONENTS.map((c) => [c, 0])) as Record<ComponentId, number>
const lift = Object.fromEntries(CLASS_IDS.map((c) => [c, zeros()])) as Record<ClassId, Record<ComponentId, number>>
const gap = Object.fromEntries(CLASS_IDS.map((c) => [c, zeros()])) as Record<ClassId, Record<ComponentId, number>>
const behind = Object.fromEntries(CLASS_IDS.map((c) => [c, 0])) as Record<ClassId, number>
for (const a of players) {
  const list = scored(a, true)
  const first = list[0]!
  for (const cls of CLASS_IDS) {
    const best = list.find((s) => s.build.classId === cls)
    if (!best) continue
    // What the class's best build gains or loses on each component, versus the average build.
    for (const c of best.components) lift[cls][c.id] += c.rel / PLAYERS
    if (best === first) continue
    // How far it trails the #1, split by component (the average build cancels out).
    behind[cls]++
    for (const c of first.components) gap[cls][c.id] += c.rel
    for (const c of best.components) gap[cls][c.id] -= c.rel
  }
}
for (const cls of CLASS_IDS) for (const c of COMPONENTS) gap[cls][c] /= Math.max(1, behind[cls])

// ——— Fixtures: class fans (D30's check, rebuilt) and personas ——————————————————————————————————————————————

const fans = CLASS_FANS.map((f) => {
  const results = rank(f.answers, data).results
  const own = results.find((r) => builds.get(r.buildId)?.classId === f.classId)
  return { ...f, first: results[0]?.buildId ?? '-', own: own ? `${own.rank}. ${buildName(own.buildId)}` : '—', ok: (own?.rank ?? 99) <= 3 }
})
const personas = PERSONAS.map((p) => {
  const ids = rank(p.answers, data).results.map((r) => r.buildId)
  return { p, ok: p.expect.every(({ inTop, anyOf }) => ids.slice(0, inTop).some((id) => anyOf.includes(id))), first: ids[0] ?? '-' }
})

// ——— Report ————————————————————————————————————————————————————————————————————————————————————————

const lines: string[] = []
const out = (s = '') => lines.push(s)
const check = (ok: boolean) => (ok ? '✅' : '❌')
const maxFlip = optionRows.reduce((m, r) => (r.flips > m.flips ? r : m))

out('# Balance report')
out()
out(`> Generated by \`npm run balance\` (engine v${ENGINE_VERSION}, data v${data.meta.dataVersion}). Do not edit by hand.`)
out()
out(`**Players:** ${PLAYERS} seeded random players (\`randomAnswers\`, seeds 1–${PLAYERS}) with random setups. Each question is`)
out('skipped 15% of the time. The last screen (hard preferences, race, classes to skip) and result-page tweaks are cleared,')
out('so this measures what the questions alone do. Random answers are not real players: role options are spread evenly')
out('across roles by design, which alone lifts tanks and healers above their share of builds.')
out()
out('## Targets')
out()
out('| Target | Now | |')
out('|---|---|---|')
const classes = CLASS_IDS.map((c) => classTop[c])
out(`| Every class ${pct(TARGETS.classMin)}–${pct(TARGETS.classMax)} of #1s | ${pct(Math.min(...classes))}–${pct(Math.max(...classes))} | ${check(classes.every((x) => x >= TARGETS.classMin && x <= TARGETS.classMax))} |`)
out(`| Tank #1 ≤ ${pct(TARGETS.tankMax)} | ${pct(roleTop.tank)} | ${check(roleTop.tank <= TARGETS.tankMax)} |`)
out(`| Healer #1 ≤ ${pct(TARGETS.healerMax)} | ${pct(roleTop.healer)} | ${check(roleTop.healer <= TARGETS.healerMax)} |`)
out(`| No answer flips the #1 build for more than ${pct(TARGETS.flipMax)} of players | ${pct(maxFlip.flips)} (${maxFlip.question}: ${maxFlip.option}) | ${check(maxFlip.flips <= TARGETS.flipMax)} |`)
out(`| Every class fan finds their class in the top 3 | ${fans.filter((f) => f.ok).length} of ${fans.length} | ${check(fans.every((f) => f.ok))} |`)
out(`| Every persona passes its checks | ${personas.filter((p) => p.ok).length} of ${personas.length} | ${check(personas.every((p) => p.ok))} |`)
out()
out('## #1 by role')
out()
out('| Role | #1 share | Share of builds |')
out('|---|--:|--:|')
for (const r of ROLES) out(`| ${r} | ${pct(roleTop[r])} | ${pct(roleBuilds[r])} |`)
out()
out('## #1 by class')
out()
out('| Class | #1 share | In the top 3 | Share of builds |')
out('|---|--:|--:|--:|')
for (const c of [...CLASS_IDS].sort((x, y) => classTop[y] - classTop[x])) {
  out(`| ${className(c)} | ${pct(classTop[c])} | ${pct(classTop3[c])} | ${pct(classBuilds[c])} |`)
}
out()
out('## #1 by build')
out()
out('| Build | Role | #1 share |')
out('|---|---|--:|')
for (const { b, n } of [...buildTop].sort((x, y) => y.n - x.n)) out(`| ${b.name} | ${b.role} | ${pct(n)} |`)
out()
out('## What each answer does')
out()
out('**Flips:** how often choosing this answer instead of skipping the question changes the #1 build (the player keeps')
out('their other answers; a priority pick is tested as the only priority). **#1 role mix** is tank / healer / damage among')
out('the #1s when it is chosen. **Lifts most:** the class whose #1 share grows most, in points.')
out()
out('| Question | Answer | Flips | #1 role mix (T / H / D) | Lifts most |')
out('|---|---|--:|---|---|')
for (const r of optionRows) {
  const mix = ROLES.map((role) => (100 * r.roles[role]).toFixed(0)).join(' / ')
  out(`| ${r.question} | ${r.option} | ${pct(r.flips)} | ${mix} | ${className(r.gain.cls)} +${pts(r.gain.delta)} |`)
}
out()
out('## Why classes win or lose')
out()
out("**Lift:** what each class's best build gains (+) or loses (−) on each score component versus the average build, in")
out('points of score (×100), averaged over all players. The match % curve is steep: 1 point of score is ~4 match points')
out('near the middle.')
out()
out(`| Component | ${CLASS_IDS.map(className).join(' | ')} |`)
out(`|---|${CLASS_IDS.map(() => '--:').join('|')}|`)
for (const comp of COMPONENTS) out(`| ${comp} | ${CLASS_IDS.map((c) => pts(lift[c][comp])).join(' | ')} |`)
out(`| **total** | ${CLASS_IDS.map((c) => `**${pts(COMPONENTS.reduce((s, comp) => s + lift[c][comp], 0))}**`).join(' | ')} |`)
out()
out("**Gap to #1:** when a class isn't #1, how far its best build trails the #1 build on each component, in points of")
out('score (×100). Positive = the #1 is ahead on that component.')
out()
out(`| Component | ${CLASS_IDS.map(className).join(' | ')} |`)
out(`|---|${CLASS_IDS.map(() => '--:').join('|')}|`)
for (const comp of COMPONENTS) out(`| ${comp} | ${CLASS_IDS.map((c) => pts(gap[c][comp])).join(' | ')} |`)
out(`| **total** | ${CLASS_IDS.map((c) => `**${pts(COMPONENTS.reduce((s, comp) => s + gap[c][comp], 0))}**`).join(' | ')} |`)
out()
out('## Class fans')
out()
out("One fan per class (`CLASS_FANS` in `src/engine/personas.ts`), answering the way a typical player of that class would.")
out('D30 reported "all 9 in the top 3" but did not keep its players; these rebuild that check.')
out()
out('| Fan | Class | #1 | Best of their class | Top 3 |')
out('|---|---|---|---|---|')
for (const f of fans) out(`| ${f.label} | ${className(f.classId)} | ${buildName(f.first)} | ${f.own} | ${check(f.ok)} |`)
out()
out('## Personas')
out()
out('| Persona | #1 | Checks |')
out('|---|---|---|')
for (const { p, ok, first } of personas) out(`| ${p.label} | ${buildName(first)} | ${check(ok)} |`)
out()

const target = fileURLToPath(new URL('../docs/BALANCE.md', import.meta.url))
writeFileSync(target, lines.join('\n'))
console.log(`Wrote ${target}`)
if (process.argv.includes('--print')) {
  console.log(`#1 roles: ${ROLES.map((r) => `${r} ${pct(roleTop[r])}`).join(', ')}`)
  console.log(`#1 classes: ${[...CLASS_IDS].sort((x, y) => classTop[y] - classTop[x]).map((c) => `${c} ${pct(classTop[c])}`).join(', ')}`)
  console.log(`most flips: ${maxFlip.question}: ${maxFlip.option} ${pct(maxFlip.flips)} · class fans ${fans.filter((f) => f.ok).length}/9`)
}
