import type { Aesthetic, AxisId, Faction, Flag, HardFilter, Role, TagId, Wording } from '../data/schemas'

export type Experience = 'new' | 'played' | 'veteran'
export type FactionChoice = Faction | 'any'
export type Ruleset = 'normal' | 'pvp' | 'rp' | 'hardcore'
export type SkybornePack = 'yes' | 'no' | 'unsure'

export type Setup = {
  experience: Experience
  faction: FactionChoice
  ruleset: Ruleset
  skyborne: SkybornePack
}

/** Tweak slider position per axis: an index into CONFIG.tweakMultipliers (4 = ×1, neutral). */
export type TweakLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7

export type Answers = {
  setup: Setup
  /** By question id: an option id (single/slider), ordered option ids (priorities) or option ids (multi). Missing = skipped. */
  picks: Record<string, string | string[] | null | undefined>
  tweaks?: Partial<Record<AxisId, TweakLevel>>
}

export type AxisPreference = { target: number; weight: number }

export type PlayerProfile = {
  setup: Setup
  axes: Record<AxisId, AxisPreference>
  tags: Partial<Record<TagId, number>>
  tagWeight: number
  roles: Record<Role, number>
  roleFlex: number
  roleWeight: number
  filters: HardFilter[]
  flags: Flag[]
  aesthetic: Partial<Record<Aesthetic, number>>
  novelty: number
  /** Ordered picks from the priorities question. */
  priorities: AxisId[]
  /** Axes the player turned below "as answered" on the tweak sliders. */
  turnedDown: AxisId[]
}

export type ComponentId = AxisId | 'tags' | 'role' | 'novelty'

export type Component = {
  id: ComponentId
  weight: number
  /** How well the build fits the player on this component, 0–1. */
  fit: number
  /** Share of the total score this component adds versus the average eligible build (+ helps, − hurts). */
  rel: number
}

export type Reason = { source: ComponentId | 'strength' | 'weakness' | 'pitch'; text: Wording }

export type RaceContribution = {
  kind: 'racial' | 'classSpell' | 'aesthetic' | 'novelty' | 'purchase'
  name: string
  value: number
  effect?: string
}

export type RaceResult = {
  raceId: string
  score: number
  newInForever: boolean
  /** Skyborne while the player isn't sure they own the pack. */
  needsPack: boolean
  contributions: RaceContribution[]
  reasons: { name: string; text: Wording }[]
}

export type BuildResult = {
  buildId: string
  rank: number
  /** Raw weighted fit, 0–1. */
  score: number
  /** Calibrated match percentage. */
  match: number
  components: Component[]
  reasons: Reason[]
  watchOuts: Reason[]
  /** Best races first (max 3). */
  races: RaceResult[]
  dualSpec: { buildId: string; reason: Wording } | null
  /** The best race for this build is a combination that's new in Forever. */
  newCombo: boolean
}

export type ExcludedBuild = { buildId: string; reason: HardFilter | 'noRace' }

export type WhyNot = { buildId: string; rank: number | null; match: number | null; reason: Wording }

export type RankResult = {
  engineVersion: number
  dataVersion: number
  profile: PlayerProfile
  results: BuildResult[]
  excluded: ExcludedBuild[]
  whyNot: WhyNot[]
  notes: Wording[]
}
