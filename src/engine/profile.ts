import { AXIS_IDS } from '../data/vocab'
import type { Aesthetic, AxisId, Effect, Flag, HardFilter, Role, TagId } from '../data/schemas'
import { CONFIG } from './config'
import { entries, type EngineContext } from './context'
import type { Answers, AxisPreference, PlayerProfile } from './types'

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x))

/** Step 1 of the engine: turn answers into targets, weights, affinities and filters. */
export function buildProfile(answers: Answers, ctx: EngineContext): PlayerProfile {
  const acc = Object.fromEntries(AXIS_IDS.map((a) => [a, { weight: 0, weightedTarget: 0 }])) as Record<
    AxisId,
    { weight: number; weightedTarget: number }
  >
  const tags: Partial<Record<TagId, number>> = {}
  const roles: Record<Role, number> = { tank: 0, healer: 0, dps: 0 }
  const filters = new Set<HardFilter>()
  const flags = new Set<Flag>()
  const aesthetic: Partial<Record<Aesthetic, number>> = {}
  const priorities: AxisId[] = []
  let roleFlex = 0
  let novelty = 0

  const addAxis = (axis: AxisId, target: number, weight: number) => {
    acc[axis].weight += weight
    acc[axis].weightedTarget += target * weight
  }
  const apply = (e: Effect) => {
    for (const [axis, v] of entries(e.axes)) addAxis(axis, v.target, v.weight)
    for (const [tag, v] of entries(e.tags)) tags[tag] = (tags[tag] ?? 0) + v
    for (const [role, v] of entries(e.roles)) roles[role] += v
    roleFlex += e.roleFlex ?? 0
    e.filters?.forEach((f) => filters.add(f))
    e.flags?.forEach((f) => flags.add(f))
    for (const [a, v] of entries(e.aesthetic)) aesthetic[a] = (aesthetic[a] ?? 0) + v
    novelty += e.novelty ?? 0
  }

  for (const q of ctx.data.questions.questions) {
    const pick = answers.picks[q.id]
    if (pick == null) continue
    const ids = Array.isArray(pick) ? pick : [pick]
    if (q.type === 'priorities') {
      ids.slice(0, q.pick).forEach((id, rank) => {
        const option = q.options.find((o) => o.id === id)
        if (!option || priorities.includes(option.axis)) return
        priorities.push(option.axis)
        addAxis(option.axis, option.target ?? 5, q.rankWeights[rank] ?? 0)
      })
    } else if (q.type === 'multi') {
      for (const id of ids) {
        const option = q.options.find((o) => o.id === id)
        if (option) apply(option.effects)
      }
    } else {
      const option = q.options.find((o) => o.id === ids[0])
      if (option) apply(option.effects)
    }
  }

  const axes = {} as Record<AxisId, AxisPreference>
  for (const a of AXIS_IDS) {
    const { weight, weightedTarget } = acc[a]
    axes[a] = { target: weight > 0 ? weightedTarget / weight : 2.5, weight }
  }

  // Context modifiers (brief §7.3).
  const raise = (a: AxisId, minTarget: number, addWeight: number) => {
    const p = axes[a]
    p.target = p.weight > 0 ? Math.max(p.target, minTarget) : minTarget
    p.weight += addWeight
  }
  const cap = (a: AxisId, maxTarget: number, addWeight: number) => {
    const p = axes[a]
    p.target = p.weight > 0 ? Math.min(p.target, maxTarget) : maxTarget
    p.weight += addWeight
  }
  const { setup } = answers
  const c = CONFIG.context
  if (setup.ruleset === 'hardcore') {
    raise('survivability', c.hardcore.survivability.minTarget, c.hardcore.survivability.addWeight)
    raise('soloLeveling', c.hardcore.soloLeveling.minTarget, c.hardcore.soloLeveling.addWeight)
  }
  if (setup.ruleset === 'pvp') {
    raise('worldPvp', c.pvp.worldPvp.minTarget, c.pvp.worldPvp.addWeight)
    raise('survivability', c.pvp.survivability.minTarget, c.pvp.survivability.addWeight)
  }
  if (setup.experience === 'new' && !flags.has('wantsComplexity')) {
    cap('complexity', c.newcomer.complexity.maxTarget, c.newcomer.complexity.addWeight)
    raise('soloLeveling', c.newcomer.soloLeveling.minTarget, c.newcomer.soloLeveling.addWeight)
  }

  // Per-axis multipliers: speculative axes (data) and the player's tweak sliders.
  for (const a of AXIS_IDS) {
    axes[a].weight *= ctx.axes.get(a)?.weightMultiplier ?? 1
    const tweak = answers.tweaks?.[a]
    if (tweak != null) axes[a].weight *= CONFIG.tweakMultipliers[tweak] ?? 1
  }

  let tagStrength = 0
  for (const [tag, v] of entries(tags)) {
    const clamped = clamp(v, -3, 3)
    if (clamped === 0) delete tags[tag]
    else tags[tag] = clamped
    tagStrength += Math.abs(clamped)
  }
  const tagWeight =
    tagStrength > 0
      ? Math.min(CONFIG.tags.max, CONFIG.tags.base + CONFIG.tags.perPoint * tagStrength) *
        (setup.ruleset === 'rp' ? CONFIG.tags.rpMultiplier : 1)
      : 0

  for (const r of Object.keys(roles) as Role[]) roles[r] = clamp(roles[r], -2, 2)
  const roleWeight = Object.values(roles).some((v) => v !== 0) || roleFlex > 0 ? CONFIG.role.weight : 0

  return {
    setup,
    axes,
    tags,
    tagWeight,
    roles,
    roleFlex,
    roleWeight,
    filters: [...filters].sort(),
    flags: [...flags].sort(),
    aesthetic,
    novelty: clamp(novelty, -2, 2),
    priorities,
  }
}

/** Answers with the first two priorities swapped — used to find a dual-spec partner for priority #2. */
export function swapTopPriorities(answers: Answers, ctx: EngineContext): Answers {
  const qid = ctx.prioritiesQuestionId
  const pick = qid ? answers.picks[qid] : undefined
  if (!qid || !Array.isArray(pick) || pick.length < 2) return answers
  const [first, second, ...rest] = pick as [string, string, ...string[]]
  return { ...answers, picks: { ...answers.picks, [qid]: [second, first, ...rest] } }
}
