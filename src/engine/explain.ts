import { AXIS_IDS } from '../data/vocab'
import type { AxisId, Build, TagId, Wording } from '../data/schemas'
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

/** Whether a build strength may back "why it fits"; `own` is the axis the reason is about, which always may. */
type Welcome = (strength: Build['strengths'][number], own?: AxisId) => boolean

/**
 * Axes the player doesn't want to hear about: the ones they turned down on the tweak sliders, and whole activity
 * families (solo, group PvE, PvP) they left out when they picked what makes a great session, with no other answer
 * pointing to them either.
 */
export function unwantedAxes(profile: PlayerProfile): Set<AxisId> {
  const out = new Set<AxisId>(profile.turnedDown)
  if (profile.priorities.length > 0) {
    for (const family of CONFIG.explain.activityFamilies) {
      if (family.every((a) => profile.axes[a].weight === 0)) family.forEach((a) => out.add(a))
    }
  }
  return out
}

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

function fitReason(c: Component, build: Build, profile: PlayerProfile, ctx: EngineContext, used: Used, welcome: Welcome): Reason | null {
  const ex = ctx.data.explanations
  if (isAxis(c.id)) {
    if (profile.setup.ruleset === 'hardcore' && !used.hardcore && (c.id === 'survivability' || c.id === 'soloLeveling')) {
      used.hardcore = true
      return { source: c.id, text: build.hardcoreNote }
    }
    const own = c.id
    const i = build.strengths.findIndex((s, idx) => !used.strengths.has(idx) && s.axes.includes(own) && welcome(s, own))
    const strength = build.strengths[i]
    if (strength) {
      used.strengths.add(i)
      return { source: c.id, text: strength.text }
    }
    const axis = ctx.axes.get(c.id)
    if (!axis) return null
    // Describe the build, not the answer: a "practical" packer matched with leather gets "medium armor", not "heavy".
    const value = build.axes[c.id]
    const { low, high } = CONFIG.explain.fitBands
    const text =
      axis.mode === 'atLeast' || value >= high ? axis.texts.highFit : value <= low ? axis.texts.lowFit : axis.texts.midFit
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

/**
 * Whether a component's "why it fits" text is true of the build even without an edge over other builds
 * (positive components earn their text by standing out; fallback ones must describe the build).
 */
function describes(c: Component, build: Build, profile: PlayerProfile, ctx: EngineContext): boolean {
  if (isAxis(c.id)) return ctx.axes.get(c.id)?.mode !== 'atLeast' || build.axes[c.id] >= CONFIG.explain.fitBands.high
  if (c.id === 'role') {
    const classRoles = ctx.classes.get(build.classId)?.roles.length ?? 1
    return profile.roles[build.role] > 0 || (profile.roleFlex > 0 && classRoles > 1)
  }
  if (c.id === 'novelty') return profile.novelty > 0 ? build.novelty >= 2 : build.novelty <= 1
  return true
}

const sameText = (a: Wording, b: Wording) => a.newcomer === b.newcomer

/**
 * Step 6: up to 3 "why it fits" reasons (at least 1; the top 3 always have 3 in practice) and 1–2 "watch out" caveats.
 * Reasons never lean on what the player turned down, skipped or what counts against the build for them (D46).
 */
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

  // A strength never leans on an axis the player doesn't want, or on one that counts against this build for them
  // (that would contradict a "watch out"). Only the axis a reason is about is exempt: it does count for this build.
  const unwanted = unwantedAxes(profile)
  const against = new Set(components.filter((c) => c.rel < -minRel).map((c) => c.id))
  const welcome: Welcome = (s, own) => s.axes.every((a) => a === own || (!unwanted.has(a) && !against.has(a)))

  const reasons: Reason[] = []
  // "Damage role fits your answers" says little on a DPS card, so it only fills a gap at the end.
  const lowValue = (c: Component) => c.id === 'role' && build.role === 'dps' && profile.roleFlex <= 0
  const positives = components
    .filter((c) => c.rel > minRel)
    .sort((a, b) => Number(lowValue(a)) - Number(lowValue(b)) || b.rel - a.rel)
  for (const c of positives) {
    if (reasons.length >= maxReasons) break
    push(reasons, fitReason(c, build, profile, ctx, used, welcome))
  }
  build.strengths.forEach((s, i) => {
    if (reasons.length < maxReasons && !used.strengths.has(i) && welcome(s)) {
      used.strengths.add(i)
      push(reasons, { source: 'strength', text: s.text })
    }
  })
  // Still short (a weak fit, or the player ruled out what the build is known for): fall back to the components
  // that don't count against it, as long as their plain description is true for this build.
  const neutral = components
    .filter((c) => c.rel <= minRel && c.rel >= -minRel && !(isAxis(c.id) && unwanted.has(c.id)))
    .sort((a, b) => b.rel - a.rel)
  for (const c of neutral) {
    if (reasons.length >= maxReasons) break
    if (describes(c, build, profile, ctx)) push(reasons, fitReason(c, build, profile, ctx, used, welcome))
  }
  // A poor fit can run out (never seen in the top 3; lower ranks only show their first reason): say what the build is.
  if (reasons.length === 0) reasons.push({ source: 'pitch', text: build.pitch })

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
