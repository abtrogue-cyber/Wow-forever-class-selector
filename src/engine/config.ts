import type { AxisId, RacialTag, Role } from '../data/schemas'

/** Bump whenever the same answers could produce a different result. Share links carry it. */
export const ENGINE_VERSION = 3

type Needs = Partial<Record<RacialTag, number>>

const roleNeeds: Record<Role, Needs> = {
  dps: { critChance: 1, critPower: 0.7, haste: 1, burstCD: 1, resourcePool: 0.3 },
  healer: { manaRegen: 1, critPower: 0.7, haste: 0.8, burstCD: 0.5, resourcePool: 0.6, critChance: 0.5, healUtility: 0.8 },
  tank: { health: 1, defensiveCD: 1, avoidance: 0.8, haste: 0.3, critChance: 0.3, burstCD: 0.3, resourcePool: 0.3 },
}

const baseNeeds: Needs = {
  downtime: 0.2, mobility: 0.2, escape: 0.2, selfHeal: 0.2, utility: 0.1,
  beastDamage: 0.1, elementalDamage: 0.05, gold: 0.05, profession: 0.05,
}

/** Extra needs from what the player cares about, scaled by that axis' weight / axisScale (capped). */
const axisNeeds: Partial<Record<AxisId, Needs>> = {
  worldPvp: { stunBreak: 1, fearBreak: 1, rootBreak: 0.7, stunResist: 0.7, escape: 0.7, stealthDetect: 0.6, controlCD: 0.7, cleanseSelf: 0.5, defensiveCD: 0.5, mobility: 0.3 },
  battlegrounds: { stunBreak: 1, fearBreak: 1, rootBreak: 0.7, stunResist: 0.7, controlCD: 0.7, cleanseSelf: 0.5, defensiveCD: 0.5, escape: 0.4 },
  survivability: { escape: 1, defensiveCD: 0.8, selfHeal: 0.8, health: 0.6, controlCD: 0.5, cleanseSelf: 0.3 },
  sustain: { downtime: 1, manaRegen: 0.5, selfHeal: 0.4 },
  soloLeveling: { beastDamage: 0.6, downtime: 0.5, mobility: 0.5, selfHeal: 0.3, elementalDamage: 0.2 },
  goldFarming: { gold: 0.8, profession: 0.5, mobility: 0.4, downtime: 0.3 },
}

export const CONFIG = {
  /** Fit curve: 1 − (distance / 5)^exponent. 1 off → 0.91, 2 off → 0.75, 3 off → 0.54. */
  fitExponent: 1.5,
  /** Tag weight grows with how strongly the player expressed a fantasy. */
  tags: { base: 0.5, perPoint: 0.35, max: 3, rpMultiplier: 1.3 },
  role: { weight: 4, perPoint: 0.25, hybridBonus: 0.12 },
  novelty: { weightPerPoint: 0.8, saturateAt: 2 },
  /**
   * match = 100 · σ(k · (score − s0)), clamped. Refitted for the person-first quiz on the persona fixtures
   * (raw #1 ≈ 0.91–0.97, median ≈ 0.77–0.84) so a great fit lands at 88–95%, the median build at ~40–65%,
   * and #1 stays ≥ 15 points above #10.
   */
  calibration: { k: 18, s0: 0.8, min: 5, max: 97 },
  context: {
    hardcore: { survivability: { minTarget: 4, addWeight: 2 }, soloLeveling: { minTarget: 4, addWeight: 1 } },
    pvp: { worldPvp: { minTarget: 3.5, addWeight: 1.2 }, survivability: { minTarget: 3.5, addWeight: 0.5 } },
    newcomer: { complexity: { maxTarget: 2, addWeight: 1 }, soloLeveling: { minTarget: 3.5, addWeight: 0.5 } },
  },
  /** Tweak slider multipliers (index 4 = neutral). */
  tweakMultipliers: [0, 0.25, 0.5, 0.75, 1, 1.5, 2, 3],
  races: {
    roleNeeds,
    baseNeeds,
    axisNeeds,
    axisScale: 3,
    axisNeedCap: 1.5,
    /** Mana regeneration barely matters to classes without mana. */
    nonManaFactor: 0.15,
    /** A full look match (3 × 3/3) is worth ~4.5, about as much as a strong racial edge. */
    aestheticWeight: 1.5,
    rpAestheticMultiplier: 1.5,
    noveltyBonus: 0.6,
    unsurePenalty: 1,
    maxReasons: 2,
    minReasonValue: 0.3,
  },
  explain: {
    /** Contributions smaller than this (share of the score) don't become reasons. */
    minRel: 0.004,
    maxReasons: 3,
    maxWatchOuts: 2,
    /** "Closeness" axis reasons describe the build: at or below `low` reads as the low end, at or above `high` as the high end. */
    fitBands: { low: 1.5, high: 4 },
    /**
     * Activities that belong together. A player who answered the priorities question and whose answers give no
     * weight to any axis of a family (solo, group PvE, PvP) never sees a strength about that family.
     */
    activityFamilies: [
      ['soloLeveling', 'goldFarming'],
      ['dungeon', 'raid'],
      ['worldPvp', 'battlegrounds'],
    ],
    whyNotCount: 3,
    whyNotSkipTop: 5,
    /** Below this top match % we say the answers pull in different directions. */
    contradictoryBelow: 65,
  },
} as const
