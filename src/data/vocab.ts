// Vocabularies: plain id lists, no Zod. App and engine code import these directly so the validator
// (schemas.ts) never ends up in the production bundle. Fixed lists give exact types (Record<AxisId, …>);
// the JSON files describe them and tests check both sides match.

export const AXIS_IDS = [
  'range', 'complexity', 'soloLeveling', 'sustain', 'survivability', 'dungeon', 'raid',
  'worldPvp', 'battlegrounds', 'goldFarming', 'groupUtility', 'petReliance', 'burst', 'armor',
] as const

export const TAG_IDS = [
  'holy', 'shadow', 'nature', 'elements', 'arcane', 'fire', 'frost', 'fel', 'beast',
  'stealth', 'berserker', 'shapeshifter', 'protector', 'healer', 'sharpshooter', 'trickster',
] as const

export const CLASS_IDS = ['druid', 'hunter', 'mage', 'paladin', 'priest', 'rogue', 'shaman', 'warlock', 'warrior'] as const

export const ROLES = ['tank', 'healer', 'dps'] as const

export const FACTIONS = ['alliance', 'horde'] as const

// What a racial is good for. Builds and player context turn these into a "needs" vector.
export const RACIAL_TAGS = [
  'critChance', 'critPower', 'haste', 'burstCD', 'defensiveCD', 'stunBreak', 'stunResist',
  'fearBreak', 'rootBreak', 'cleanseSelf', 'escape', 'stealthDetect', 'controlCD', 'health',
  'avoidance', 'mobility', 'downtime', 'selfHeal', 'manaRegen', 'resourcePool', 'beastDamage',
  'elementalDamage', 'gold', 'profession', 'utility', 'healUtility',
] as const

export const AESTHETICS = ['noble', 'rugged', 'clever', 'elven', 'primal', 'eerie'] as const

export const HARD_FILTERS = ['noPets', 'mustHeal', 'mustTank', 'noHeal', 'noTank', 'rangedOnly', 'meleeOnly', 'noStealth'] as const

export const FLAGS = ['wantsComplexity'] as const

export const SETUP_FIELDS = ['experience', 'faction', 'ruleset', 'skyborne'] as const
export const SETUP_OPTIONS = {
  experience: ['new', 'played', 'veteran'],
  faction: ['alliance', 'horde', 'any'],
  ruleset: ['normal', 'pvp', 'rp', 'hardcore'],
  skyborne: ['yes', 'no', 'unsure'],
} as const
