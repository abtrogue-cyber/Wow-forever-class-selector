import type { Answers } from './types'

/**
 * Fixture players used by the snapshot tests, the /debug page and docs/SCORES_REVIEW.md.
 * `expect` lists sanity checks a WoW player would agree with — not exact rankings.
 */
export type Persona = {
  id: string
  label: string
  answers: Answers
  expect: { inTop: number; anyOf: string[] }[]
}

export const PERSONAS: Persona[] = [
  {
    id: 'cozy-healer',
    label: 'Cozy healer (new, any faction, must heal)',
    answers: {
      setup: { experience: 'new', faction: 'any', ruleset: 'normal', skyborne: 'no' },
      picks: {
        gnolls: 'blast', 'boss-pull': 'behind', 'light-shadow': 'light', 'nature-arcane': 'nature', 'plate-robes': 'robes',
        'simple-complex': 'simple', 'burst-dot': 'dot', downtime: 'mostly-fine', 'bad-pull': 'outlast',
        priorities: ['dungeons', 'solo', 'raids'], 'deal-breakers': ['must-heal'], look: 'elven', 'new-classic': 'classic',
      },
    },
    expect: [
      { inTop: 1, anyOf: ['druid-restoration', 'priest-holy', 'priest-discipline', 'shaman-restoration', 'paladin-holy'] },
      { inTop: 3, anyOf: ['druid-restoration', 'priest-holy'] },
    ],
  },
  {
    id: 'hardcore-survivor',
    label: 'Hardcore survivor (pets, solo, escapes)',
    answers: {
      setup: { experience: 'played', faction: 'any', ruleset: 'hardcore', skyborne: 'no' },
      picks: {
        gnolls: 'companion', 'boss-pull': 'ranged', 'nature-arcane': 'nature', 'pet-solo': 'pet', 'simple-complex': 'simple',
        downtime: 'annoying', 'bad-pull': 'escape', priorities: ['solo', 'gold', 'dungeons'], 'deal-breakers': [],
        look: 'rugged', 'new-classic': 'classic',
      },
    },
    expect: [
      { inTop: 1, anyOf: ['hunter-beast-mastery'] },
      { inTop: 5, anyOf: ['warlock-demonology', 'warlock-affliction'] },
    ],
  },
  {
    id: 'world-pvp-ganker',
    label: 'World-PvP ganker (Horde, PvP ruleset, stealth)',
    answers: {
      setup: { experience: 'veteran', faction: 'horde', ruleset: 'pvp', skyborne: 'no' },
      picks: {
        gnolls: 'vanish', 'boss-pull': 'melee', 'light-shadow': 'shadow', 'pet-solo': 'solo', 'simple-complex': 'complex',
        'burst-dot': 'burst', downtime: 'meh', 'bad-pull': 'escape', priorities: ['world-pvp', 'battlegrounds', 'gold'],
        'deal-breakers': [], look: 'eerie',
      },
    },
    expect: [
      { inTop: 2, anyOf: ['rogue-subtlety'] },
      { inTop: 3, anyOf: ['rogue-assassination', 'druid-feral-cat', 'rogue-combat'] },
    ],
  },
  {
    id: 'pet-lover-no-downtime',
    label: 'Pet lover who hates downtime (new, Alliance)',
    answers: {
      setup: { experience: 'new', faction: 'alliance', ruleset: 'normal', skyborne: 'no' },
      picks: {
        gnolls: 'companion', 'boss-pull': 'ranged', 'light-shadow': 'shadow', 'pet-solo': 'pet', 'simple-complex': 'simple',
        downtime: 'unbearable', 'bad-pull': 'outlast', priorities: ['solo', 'gold', 'dungeons'], 'deal-breakers': [],
      },
    },
    expect: [
      { inTop: 3, anyOf: ['hunter-beast-mastery'] },
      { inTop: 3, anyOf: ['warlock-demonology', 'warlock-affliction'] },
    ],
  },
  {
    id: 'raid-logger',
    label: 'Raid logger (veteran, ranged, complex, owns Skyborne)',
    answers: {
      setup: { experience: 'veteran', faction: 'any', ruleset: 'normal', skyborne: 'yes' },
      picks: {
        gnolls: 'blast', 'boss-pull': 'ranged', 'nature-arcane': 'arcane', 'plate-robes': 'robes', 'pet-solo': 'solo',
        'simple-complex': 'complex', 'burst-dot': 'burst', downtime: 'meh', 'bad-pull': 'burn',
        priorities: ['raids', 'dungeons', 'gold'], 'deal-breakers': [],
      },
    },
    expect: [{ inTop: 3, anyOf: ['mage-arcane', 'mage-fire'] }],
  },
  {
    id: 'total-newcomer',
    label: 'Total newcomer (plate, simple, Light)',
    answers: {
      setup: { experience: 'new', faction: 'any', ruleset: 'normal', skyborne: 'unsure' },
      picks: {
        gnolls: 'charge', 'boss-pull': 'melee', 'light-shadow': 'light', 'plate-robes': 'plate', 'simple-complex': 'simple',
        'burst-dot': 'burst', downtime: 'annoying', 'bad-pull': 'outlast', priorities: ['solo', 'dungeons', 'world-pvp'],
        'deal-breakers': [], look: 'noble', 'new-classic': 'new',
      },
    },
    expect: [
      { inTop: 2, anyOf: ['paladin-retribution'] },
      { inTop: 4, anyOf: ['warrior-arms', 'warrior-fury', 'paladin-protection'] },
    ],
  },
  {
    id: 'petless-hunter-fan',
    label: 'Petless hunter fan (no pets, ranged only)',
    answers: {
      setup: { experience: 'played', faction: 'alliance', ruleset: 'normal', skyborne: 'no' },
      picks: {
        gnolls: 'blast', 'boss-pull': 'ranged', 'nature-arcane': 'nature', 'pet-solo': 'solo', 'burst-dot': 'burst',
        downtime: 'meh', 'bad-pull': 'escape', priorities: ['solo', 'raids', 'world-pvp'],
        'deal-breakers': ['no-pets', 'ranged-only'], look: 'elven', 'new-classic': 'new',
      },
    },
    expect: [{ inTop: 1, anyOf: ['hunter-marksmanship'] }],
  },
  {
    id: 'horde-holy-knight',
    label: 'Horde holy knight (healer, plate, Light)',
    answers: {
      setup: { experience: 'played', faction: 'horde', ruleset: 'normal', skyborne: 'yes' },
      picks: {
        gnolls: 'shield', 'boss-pull': 'behind', 'light-shadow': 'light', 'plate-robes': 'plate', 'pet-solo': 'solo',
        'burst-dot': 'burst', downtime: 'meh', 'bad-pull': 'outlast', priorities: ['dungeons', 'raids', 'battlegrounds'],
        'deal-breakers': ['must-heal'], look: 'eerie', 'new-classic': 'new',
      },
    },
    expect: [{ inTop: 1, anyOf: ['paladin-holy'] }],
  },
  {
    id: 'alliance-stormcaller',
    label: 'Alliance stormcaller (elements, burst, PvP)',
    answers: {
      setup: { experience: 'veteran', faction: 'alliance', ruleset: 'normal', skyborne: 'yes' },
      picks: {
        gnolls: 'blast', 'boss-pull': 'ranged', 'nature-arcane': 'nature', 'pet-solo': 'solo', 'burst-dot': 'burst',
        downtime: 'meh', 'bad-pull': 'burn', priorities: ['battlegrounds', 'world-pvp', 'dungeons'], 'deal-breakers': [],
        look: 'rugged', 'new-classic': 'new',
      },
    },
    expect: [{ inTop: 3, anyOf: ['shaman-elemental'] }],
  },
  {
    id: 'tank-for-friends',
    label: 'Tank for friends (must tank, nature, tribal)',
    answers: {
      setup: { experience: 'played', faction: 'any', ruleset: 'normal', skyborne: 'no' },
      picks: {
        gnolls: 'shield', 'boss-pull': 'front', 'nature-arcane': 'nature', downtime: 'meh', 'bad-pull': 'outlast',
        priorities: ['dungeons', 'raids', 'solo'], 'deal-breakers': ['must-tank'], look: 'primal',
      },
    },
    expect: [
      { inTop: 1, anyOf: ['druid-feral-bear', 'warrior-protection', 'paladin-protection'] },
      { inTop: 3, anyOf: ['druid-feral-bear'] },
    ],
  },
]
