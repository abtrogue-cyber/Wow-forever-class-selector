import { AXIS_IDS, type AxisId, type Build, type TagId, type Wording } from '../data/schemas'
import { CONFIG } from './config'
import { entries, type EngineContext } from './context'
import type { RawComponent } from './score'
import type { Component, ComponentId, PlayerProfile, Reason } from './types'

const isAxis = (id: ComponentId): id is AxisId => (AXIS_IDS as readonly string[]).includes(id)

/**
 * Adds `rel` to every component: how much this build gains or loses on that component compared with
 * the average eligible build, as a share of the total weight. This is "what makes this build stand out for you".
 */
export function withRelativeContributions(all: RawComponent[][]): Component[][] {
  if (all.length === 0) return []
  const first = all[0] ?? []
  const totalWeight = first.reduce((sum, c) => sum + c.weight, 0) || 1
  const means = first.map((_, j) => all.reduce((sum, comps) => sum + (comps[j]?.fit ?? 0), 0) / all.length)
  return all.map((comps) =>
    comps.map((c, j) => ({ ...c, rel: (c.weight * (c.fit - (means[j] ?? 0))) / totalWeight })),
  )
}

type Used = { strengths: Set<number>; weaknesses: Set<number>; hardcore: boolean }

/** Tags that just restate the role; the role component already explains those. */
const ROLE_TAG: Partial<Record<Build['role'], TagId>> = { healer: 'healer', tank: 'protector' }

function bestTag(build: Build, profile: PlayerProfile, sign: 1 | -1): TagId | null {
  let best: TagId | null = null
  let bestValue = 0
  for (const [tag, strength] of entries<TagId, number>(build.tags)) {
    if (sign > 0 && tag === ROLE_TAG[build.role]) continue
    const value = sign * (profile.tags[tag] ?? 0) * strength
    if (value > bestValue) {
      best = tag
      bestValue = value
    }
  }
  return best
}

function fitReason(c: Component, build: Build, profile: PlayerProfile, ctx: EngineContext, used: Used): Reason | null {
  const ex = ctx.data.explanations
  if (isAxis(c.id)) {
    if (profile.setup.ruleset === 'hardcore' && !used.hardcore && (c.id === 'survivability' || c.id === 'soloLeveling')) {
      used.hardcore = true
      return { source: c.id, text: build.hardcoreNote }
    }
    const i = build.strengths.findIndex((s, idx) => !used.strengths.has(idx) && s.axes.includes(c.id as AxisId))
    const strength = build.strengths[i]
    if (strength) {
      used.strengths.add(i)
      return { source: c.id, text: strength.text }
    }
    const axis = ctx.axes.get(c.id)
    if (!axis) return null
    const target = profile.axes[c.id].target
    const text = axis.mode === 'atLeast' || target >= 2.5 ? axis.texts.highFit : axis.texts.lowFit
    return text ? { source: c.id, text } : null
  }
  if (c.id === 'tags') {
    const tag = bestTag(build, profile, 1)
    const text = tag ? ctx.tags.get(tag)?.fitText : undefined
    return text ? { source: 'tags', text } : null
  }
  if (c.id === 'role') {
    const classRoles = ctx.classes.get(build.classId)?.roles.length ?? 1
    const text = profile.roleFlex > 0 && classRoles > 1 && profile.roles[build.role] <= 0 ? ex.hybrid : ex.role.fit[build.role]
    return { source: 'role', text }
  }
  return { source: 'novelty', text: profile.novelty > 0 ? ex.novelty.fitNew : ex.novelty.fitClassic }
}

export function watchReason(c: Component, build: Build, profile: PlayerProfile, ctx: EngineContext, used?: Used): Reason | null {
  const ex = ctx.data.explanations
  if (isAxis(c.id)) {
    const i = build.weaknesses.findIndex((w, idx) => !used?.weaknesses.has(idx) && w.axes.includes(c.id as AxisId))
    const weakness = build.weaknesses[i]
    if (weakness) {
      used?.weaknesses.add(i)
      return { source: c.id, text: weakness.text }
    }
    const axis = ctx.axes.get(c.id)
    if (!axis) return null
    const tooHigh = axis.mode === 'closeness' && build.axes[c.id] > profile.axes[c.id].target
    const text: Wording | undefined = tooHigh ? axis.texts.highWatch : axis.texts.lowWatch
    return text ? { source: c.id, text } : null
  }
  if (c.id === 'tags') {
    const tag = bestTag(build, profile, -1)
    const text = tag ? ctx.tags.get(tag)?.watchText : undefined
    return text ? { source: 'tags', text } : null
  }
  if (c.id === 'role') return { source: 'role', text: ex.role.watch[build.role] }
  return { source: 'novelty', text: profile.novelty > 0 ? ex.novelty.watchNew : ex.novelty.watchClassic }
}

const sameText = (a: Wording, b: Wording) => a.newcomer === b.newcomer

/** Step 6: 3 "why it fits" reasons and 1–2 "watch out" caveats, always. */
export function explainBuild(
  build: Build,
  components: Component[],
  profile: PlayerProfile,
  ctx: EngineContext,
): { reasons: Reason[]; watchOuts: Reason[] } {
  const { minRel, maxReasons, maxWatchOuts } = CONFIG.explain
  const used: Used = { strengths: new Set(), weaknesses: new Set(), hardcore: false }
  const push = (list: Reason[], r: Reason | null) => {
    if (r && !list.some((x) => sameText(x.text, r.text))) list.push(r)
  }

  const reasons: Reason[] = []
  // "Damage role, as requested" says little on a DPS card, so it only fills a gap at the end.
  const lowValue = (c: Component) => c.id === 'role' && build.role === 'dps' && profile.roleFlex <= 0
  const positives = components
    .filter((c) => c.rel > minRel)
    .sort((a, b) => Number(lowValue(a)) - Number(lowValue(b)) || b.rel - a.rel)
  for (const c of positives) {
    if (reasons.length >= maxReasons) break
    push(reasons, fitReason(c, build, profile, ctx, used))
  }
  build.strengths.forEach((s, i) => {
    if (reasons.length < maxReasons && !used.strengths.has(i)) {
      used.strengths.add(i)
      push(reasons, { source: 'strength', text: s.text })
    }
  })

  const watchOuts: Reason[] = []
  const negatives = components.filter((c) => c.rel < -minRel).sort((a, b) => a.rel - b.rel)
  for (const c of negatives) {
    if (watchOuts.length >= maxWatchOuts) break
    push(watchOuts, watchReason(c, build, profile, ctx, used))
  }
  if (watchOuts.length === 0) {
    const i = build.weaknesses.findIndex((_, idx) => !used.weaknesses.has(idx))
    const weakness = build.weaknesses[i >= 0 ? i : 0]
    if (weakness) push(watchOuts, { source: 'weakness', text: weakness.text })
  }
  return { reasons, watchOuts }
}
