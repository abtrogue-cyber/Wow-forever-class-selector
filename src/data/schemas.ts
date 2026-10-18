import { z } from 'zod'

// ---------------------------------------------------------------------------
// Vocabularies. Fixed id lists give the engine exact types (Record<AxisId, …>);
// the JSON files describe them and tests check both sides match.
// ---------------------------------------------------------------------------

export const AXIS_IDS = [
  'range', 'complexity', 'soloLeveling', 'sustain', 'survivability', 'dungeon', 'raid',
  'worldPvp', 'battlegrounds', 'goldFarming', 'groupUtility', 'petReliance', 'burst', 'armor',
] as const
export const AxisId = z.enum(AXIS_IDS)
export type AxisId = z.infer<typeof AxisId>

export const TAG_IDS = [
  'holy', 'shadow', 'nature', 'elements', 'arcane', 'fire', 'frost', 'fel', 'beast',
  'stealth', 'berserker', 'shapeshifter', 'protector', 'healer', 'sharpshooter', 'trickster',
] as const
export const TagId = z.enum(TAG_IDS)
export type TagId = z.infer<typeof TagId>

export const CLASS_IDS = ['druid', 'hunter', 'mage', 'paladin', 'priest', 'rogue', 'shaman', 'warlock', 'warrior'] as const
export const ClassId = z.enum(CLASS_IDS)
export type ClassId = z.infer<typeof ClassId>

export const ROLES = ['tank', 'healer', 'dps'] as const
export const Role = z.enum(ROLES)
export type Role = z.infer<typeof Role>

export const FACTIONS = ['alliance', 'horde'] as const
export const Faction = z.enum(FACTIONS)
export type Faction = z.infer<typeof Faction>

// What a racial is good for. Builds and player context turn these into a "needs" vector.
export const RACIAL_TAGS = [
  'critChance', 'critPower', 'haste', 'burstCD', 'defensiveCD', 'stunBreak', 'stunResist',
  'fearBreak', 'rootBreak', 'cleanseSelf', 'escape', 'stealthDetect', 'controlCD', 'health',
  'avoidance', 'mobility', 'downtime', 'selfHeal', 'manaRegen', 'resourcePool', 'beastDamage',
  'elementalDamage', 'gold', 'profession', 'utility', 'healUtility',
] as const
export const RacialTag = z.enum(RACIAL_TAGS)
export type RacialTag = z.infer<typeof RacialTag>

export const AESTHETICS = ['noble', 'rugged', 'clever', 'elven', 'primal', 'eerie'] as const
export const Aesthetic = z.enum(AESTHETICS)
export type Aesthetic = z.infer<typeof Aesthetic>

export const HARD_FILTERS = ['noPets', 'mustHeal', 'mustTank', 'rangedOnly', 'meleeOnly', 'noStealth'] as const
export const HardFilter = z.enum(HARD_FILTERS)
export type HardFilter = z.infer<typeof HardFilter>

export const FLAGS = ['wantsComplexity'] as const
export const Flag = z.enum(FLAGS)
export type Flag = z.infer<typeof Flag>

export const SETUP_FIELDS = ['experience', 'faction', 'ruleset', 'skyborne'] as const
export const SETUP_OPTIONS = {
  experience: ['new', 'played', 'veteran'],
  faction: ['alliance', 'horde', 'any'],
  ruleset: ['normal', 'pvp', 'rp', 'hardcore'],
  skyborne: ['yes', 'no', 'unsure'],
} as const

// ---------------------------------------------------------------------------
// Building blocks
// ---------------------------------------------------------------------------

const Id = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'ids are kebab-case')
const IsoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD')
const Hex = z.string().regex(/^#[0-9A-F]{6}$/, 'uppercase #RRGGBB')
const SourceRefs = z.array(z.string().min(1)).min(1)
const Confidence = z.enum(['low', 'med', 'high'])
const Score = z.number().min(0).max(5).multipleOf(0.5)

/** Every player-facing sentence exists twice: no jargon, and jargon is fine. */
export const Wording = z.strictObject({ newcomer: z.string().min(1), veteran: z.string().min(1) })
export type Wording = z.infer<typeof Wording>

// ---------------------------------------------------------------------------
// Files
// ---------------------------------------------------------------------------

export const Source = z.strictObject({
  id: z.string().regex(/^[A-Z][A-Z0-9-]*$/),
  title: z.string(),
  publisher: z.string(),
  url: z.url().optional(),
  published: z.string().optional(),
  accessed: IsoDate,
  kind: z.enum(['official', 'official-beta', 'community', 'editorial']),
})
export type Source = z.infer<typeof Source>

export const Meta = z.strictObject({
  dataVersion: z.number().int().positive(),
  gameState: z.enum(['Beta', 'Launch']),
  lastVerified: IsoDate,
  note: z.string(),
})
export type Meta = z.infer<typeof Meta>

export const Axis = z.strictObject({
  id: AxisId,
  label: z.string(),
  short: z.string().max(8),
  description: z.string(),
  low: z.string(),
  high: z.string(),
  mode: z.enum(['closeness', 'atLeast']),
  /** Scales every weight on this axis (e.g. raid is speculative until raids open). */
  weightMultiplier: z.number().positive().optional(),
  /** Explanation templates, chosen by which side of the scale the build sits on. */
  texts: z.strictObject({
    highFit: Wording,
    lowWatch: Wording,
    lowFit: Wording.optional(),
    highWatch: Wording.optional(),
  }),
})
export type Axis = z.infer<typeof Axis>

export const Tag = z.strictObject({
  id: TagId,
  label: z.string(),
  description: z.string(),
  fitText: Wording,
  watchText: Wording,
})
export type Tag = z.infer<typeof Tag>

export const GameClass = z.strictObject({
  id: ClassId,
  name: z.string(),
  colorHex: Hex,
  colorVerified: z.boolean(),
  armor: z.enum(['cloth', 'leather', 'mail', 'plate']),
  roles: z.array(Role).min(1),
  resources: z.array(z.enum(['mana', 'rage', 'energy'])).min(1),
  pitch: Wording,
  /** Blizzard's own role statements from the deep dives, in our words. */
  strengths: z.array(z.string()).min(1),
  weaknesses: z.array(z.string()).min(1),
  sources: SourceRefs,
  verified: z.boolean(),
})
export type GameClass = z.infer<typeof GameClass>

const Point = z.strictObject({ axes: z.array(AxisId).min(1), text: Wording })

export const Build = z.strictObject({
  id: Id,
  classId: ClassId,
  tree: z.string(),
  role: Role,
  name: z.string(),
  pitch: Wording,
  /** Editorial 0–5 scores (see docs/SCORES_REVIEW.md). */
  axes: z.record(AxisId, Score),
  confidence: Confidence,
  lowConfidenceAxes: z.array(AxisId),
  tags: z.partialRecord(TagId, z.number().int().min(1).max(3)),
  petStyle: z.enum(['none', 'optional', 'required']),
  stealth: z.number().int().min(0).max(3),
  /** How differently it plays from Classic, 0–3 (sourced from the deep dives). */
  novelty: z.number().int().min(0).max(3),
  offTank: z.enum(['smallGroup']).optional(),
  strengths: z.array(Point).min(3),
  weaknesses: z.array(Point).min(2),
  hardcoreNote: Wording,
  newInForever: z.array(z.string()).min(1),
  variants: z.array(z.strictObject({ name: z.string(), note: z.string() })),
  dualSpecPartners: z.array(Id).min(1),
  popular: z.boolean(),
  racialNeeds: z.partialRecord(RacialTag, z.number().min(0).max(2)).optional(),
  scoreBasis: z.string(),
  sources: SourceRefs,
  /** The build's facts (role, key talents, Forever notes) are confirmed by an official source. Scores are always editorial. */
  verified: z.boolean(),
})
export type Build = z.infer<typeof Build>

const RacialTags = z.partialRecord(RacialTag, z.number().min(0.5).max(3))

const Racial = z.strictObject({
  id: Id,
  name: z.string(),
  type: z.enum(['active', 'passive']),
  effect: z.string(),
  tags: RacialTags,
  change: z.string().optional(),
  verified: z.boolean(),
})
export type Racial = z.infer<typeof Racial>

const ClassSpell = z.strictObject({ name: z.string(), effect: z.string(), tags: RacialTags })

export const Race = z.strictObject({
  id: Id,
  name: z.string(),
  shortName: z.string(),
  group: z.enum(['skyborne']).optional(),
  factions: z.array(Faction).min(1),
  requiresPurchase: z.boolean(),
  aesthetic: z.partialRecord(Aesthetic, z.number().int().min(1).max(3)),
  racials: z.array(Racial).length(4),
  classSpells: z.partialRecord(ClassId, z.array(ClassSpell)).optional(),
  sources: SourceRefs,
  verified: z.boolean(),
})
export type Race = z.infer<typeof Race>

export const RaceClassFile = z.strictObject({
  combos: z.array(z.strictObject({ raceId: Id, classId: ClassId, newInForever: z.boolean() })),
  sources: SourceRefs,
  verified: z.boolean(),
})
export type RaceClassFile = z.infer<typeof RaceClassFile>

// --- Questions -------------------------------------------------------------

export const Effect = z.strictObject({
  axes: z.partialRecord(AxisId, z.strictObject({ target: z.number().min(0).max(5), weight: z.number().min(0).max(5) })).optional(),
  tags: z.partialRecord(TagId, z.number().min(-3).max(3)).optional(),
  roles: z.partialRecord(Role, z.number().min(-2).max(2)).optional(),
  roleFlex: z.number().min(0).max(2).optional(),
  filters: z.array(HardFilter).optional(),
  flags: z.array(Flag).optional(),
  aesthetic: z.partialRecord(Aesthetic, z.number().min(0).max(3)).optional(),
  novelty: z.number().min(-2).max(2).optional(),
})
export type Effect = z.infer<typeof Effect>

const Option = z.strictObject({
  id: Id,
  label: Wording,
  /** Replaces the label on the Hardcore ruleset. */
  hardcoreLabel: Wording.optional(),
  effects: Effect,
})
export type Option = z.infer<typeof Option>

const questionBase = { id: Id, text: Wording, hint: Wording.optional() }

const SingleQuestion = z.strictObject({
  ...questionBase,
  type: z.enum(['scenario', 'thisOrThat', 'pickOne']),
  options: z.array(Option).min(2).max(7),
})
const SliderQuestion = z.strictObject({
  ...questionBase,
  type: z.literal('slider'),
  minLabel: Wording,
  maxLabel: Wording,
  options: z.array(Option).length(5),
})
const PrioritiesQuestion = z.strictObject({
  ...questionBase,
  type: z.literal('priorities'),
  pick: z.literal(3),
  rankWeights: z.array(z.number().positive()).length(3),
  options: z.array(z.strictObject({ id: Id, label: Wording, axis: AxisId })).min(3),
})
const MultiQuestion = z.strictObject({
  ...questionBase,
  type: z.literal('multi'),
  options: z.array(Option).min(1),
  /** Pairs that can't both be picked. */
  exclusive: z.array(z.tuple([Id, Id])),
})
export const Question = z.union([SingleQuestion, SliderQuestion, PrioritiesQuestion, MultiQuestion])
export type Question = z.infer<typeof Question>

const SetupField = z.strictObject({
  id: z.enum(SETUP_FIELDS),
  text: Wording,
  hint: Wording.optional(),
  options: z.array(z.strictObject({ id: Id, label: Wording, hint: Wording.optional() })).min(2),
})
export type SetupField = z.infer<typeof SetupField>

export const QuestionsFile = z.strictObject({
  setup: z.array(SetupField).length(4),
  questions: z.array(Question).min(10).max(14),
})
export type QuestionsFile = z.infer<typeof QuestionsFile>

// --- Explanation templates that aren't tied to one axis or tag -------------

export const ExplanationsFile = z.strictObject({
  role: z.strictObject({ fit: z.record(Role, Wording), watch: z.record(Role, Wording) }),
  hybrid: Wording,
  novelty: z.strictObject({ fitNew: Wording, fitClassic: Wording, watchNew: Wording, watchClassic: Wording }),
  filters: z.record(HardFilter, Wording),
  noRace: Wording,
  dualSpec: z.strictObject({
    heal: Wording,
    tank: Wording,
    generic: Wording,
    priority: z.partialRecord(AxisId, Wording),
  }),
  race: z.strictObject({ aesthetic: Wording, novelty: Wording }),
  notes: z.strictObject({ contradictory: Wording, nothingLeft: Wording }),
})
export type ExplanationsFile = z.infer<typeof ExplanationsFile>

// --- Everything together ----------------------------------------------------

export const GameDataSchema = z.strictObject({
  sources: z.array(Source),
  meta: Meta,
  axes: z.array(Axis),
  tags: z.array(Tag),
  classes: z.array(GameClass),
  builds: z.array(Build),
  races: z.array(Race),
  raceClass: RaceClassFile,
  questions: QuestionsFile,
  explanations: ExplanationsFile,
})
export type GameData = z.infer<typeof GameDataSchema>
