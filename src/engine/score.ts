import { AXIS_IDS } from '../data/vocab'
import type { Build, TagId } from '../data/schemas'
import { CONFIG } from './config'
import { entries, type EngineContext } from './context'
import type { ComponentId, PlayerProfile } from './types'

export type RawComponent = { id: ComponentId; weight: number; fit: number }

/** 1 at distance 0, falling to 0 at distance 5 (the full scale). */
export function fitCurve(distance: number): number {
  const d = Math.min(Math.max(distance, 0), 5) / 5
  return 1 - Math.pow(d, CONFIG.fitExponent)
}

/** Cosine similarity between the player's tag affinities and the build's tags, mapped to 0–1 (0.5 = unrelated). */
export function tagFit(build: Build, profile: PlayerProfile): number {
  let dot = 0
  let playerNorm = 0
  let buildNorm = 0
  for (const [tag, affinity] of entries(profile.tags)) {
    dot += affinity * (build.tags[tag] ?? 0)
    playerNorm += affinity * affinity
  }
  for (const [, strength] of entries<TagId, number>(build.tags)) buildNorm += strength * strength
  if (playerNorm === 0 || buildNorm === 0) return 0.5
  return (dot / Math.sqrt(playerNorm * buildNorm) + 1) / 2
}

export function roleFit(build: Build, profile: PlayerProfile, ctx: EngineContext): number {
  const classRoles = ctx.classes.get(build.classId)?.roles.length ?? 1
  const fit =
    0.5 +
    CONFIG.role.perPoint * profile.roles[build.role] +
    CONFIG.role.hybridBonus * profile.roleFlex * (classRoles - 1)
  return Math.min(1, Math.max(0, fit))
}

/**
 * Novelty lovers like builds that changed a lot in Forever; classic lovers like the opposite.
 * Build novelty (0–3) counts only up to `saturateAt`, so every big rework is equally "new" and no single build wins on it.
 */
export function noveltyFit(build: Build, novelty: number): number {
  const n = Math.min(build.novelty, CONFIG.novelty.saturateAt) / 3
  return novelty > 0 ? n : 1 - n
}

/** Step 3: every weighted component for one build. All builds get the same component list. */
export function componentFits(build: Build, profile: PlayerProfile, ctx: EngineContext): RawComponent[] {
  const out: RawComponent[] = []
  for (const axis of AXIS_IDS) {
    const pref = profile.axes[axis]
    if (pref.weight <= 0) continue
    const value = build.axes[axis]
    const mode = ctx.axes.get(axis)?.mode ?? 'closeness'
    const distance = mode === 'closeness' ? Math.abs(value - pref.target) : Math.max(0, pref.target - value)
    out.push({ id: axis, weight: pref.weight, fit: fitCurve(distance) })
  }
  if (profile.tagWeight > 0) out.push({ id: 'tags', weight: profile.tagWeight, fit: tagFit(build, profile) })
  if (profile.roleWeight > 0) out.push({ id: 'role', weight: profile.roleWeight, fit: roleFit(build, profile, ctx) })
  if (profile.novelty !== 0) {
    out.push({ id: 'novelty', weight: CONFIG.novelty.weightPerPoint * Math.abs(profile.novelty), fit: noveltyFit(build, profile.novelty) })
  }
  return out
}

/** Weighted mean fit, 0–1. With no preferences at all every build scores 0.5. */
export function weightedScore(components: RawComponent[]): number {
  let total = 0
  let weighted = 0
  for (const c of components) {
    total += c.weight
    weighted += c.weight * c.fit
  }
  return total > 0 ? weighted / total : 0.5
}

export function scoreBuild(build: Build, profile: PlayerProfile, ctx: EngineContext): number {
  return weightedScore(componentFits(build, profile, ctx))
}

/** Step 4: calibrated, absolute match percentage. */
export function toMatch(score: number): number {
  const { k, s0, min, max } = CONFIG.calibration
  const p = 1 / (1 + Math.exp(-k * (score - s0)))
  return Math.min(max, Math.max(min, Math.round(100 * p)))
}
