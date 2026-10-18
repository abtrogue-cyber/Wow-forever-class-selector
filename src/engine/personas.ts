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
        'two-hours': ['few-friends', 'own-pace', 'big-team'], 'group-project': 'nobody-behind', 'team-sport': 'playmaker',
        annoyance: 'too-much', wins: 'slow-certain', stuck: 'ask-friends', festival: 'backstage', packing: 'light',
        feeling: 'calm', home: 'moon-forest', restaurant: 'usual', patience: 'kind-of-nice', preferences: ['must-heal'],
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
        'two-hours': ['own-pace', 'fortune', 'few-friends'], 'group-project': 'own-part', 'team-sport': 'solo-sport',
        annoyance: 'sudden-death', stuck: 'come-back', festival: 'overview', feeling: 'freedom', home: 'mountain-hall',
        restaurant: 'usual', patience: 'annoying', preferences: ['want-companion'],
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
        'two-hours': ['rivals', 'fair-match', 'fortune'], 'group-project': 'own-part', 'team-sport': 'scorer',
        annoyance: 'sudden-death', wins: 'big-moment', stuck: 'look-it-up', festival: 'front-row', feeling: 'edge',
        home: 'misty-ruins', patience: 'annoying', preferences: [],
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
        'two-hours': ['own-pace', 'fortune', 'few-friends'], 'group-project': 'own-part', 'team-sport': 'solo-sport',
        annoyance: 'waiting', stuck: 'come-back', festival: 'overview', feeling: 'edge', patience: 'agony',
        preferences: ['want-companion'],
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
        'two-hours': ['big-team', 'few-friends', 'fortune'], 'group-project': 'hardest-part', 'team-sport': 'scorer',
        annoyance: 'not-mattering', wins: 'big-moment', stuck: 'look-it-up', festival: 'overview', packing: 'light',
        feeling: 'wonder', patience: 'annoying', preferences: [],
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
        'two-hours': ['own-pace', 'few-friends', 'rivals'], 'group-project': 'hardest-part', 'team-sport': 'scorer',
        annoyance: 'too-much', wins: 'big-moment', stuck: 'try-harder', festival: 'front-row', packing: 'sturdy',
        feeling: 'counted-on', home: 'stone-city', restaurant: 'something-new', patience: 'annoying', preferences: [],
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
        'two-hours': ['own-pace', 'big-team', 'rivals'], 'group-project': 'own-part', 'team-sport': 'scorer',
        annoyance: 'sudden-death', wins: 'big-moment', festival: 'overview', feeling: 'freedom', home: 'moon-forest',
        restaurant: 'something-new', patience: 'annoying', preferences: ['no-pets', 'ranged-only'],
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
        'two-hours': ['few-friends', 'big-team', 'fair-match'], 'group-project': 'nobody-behind', 'team-sport': 'last-line',
        annoyance: 'sudden-death', wins: 'big-moment', festival: 'backstage', packing: 'sturdy', feeling: 'counted-on',
        home: 'misty-ruins', restaurant: 'something-new', patience: 'annoying', preferences: ['must-heal'],
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
        'two-hours': ['fair-match', 'rivals', 'few-friends'], 'group-project': 'hardest-part', 'team-sport': 'scorer',
        annoyance: 'not-mattering', wins: 'big-moment', festival: 'overview', feeling: 'freedom', home: 'mountain-hall',
        restaurant: 'something-new', patience: 'annoying', preferences: [],
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
        'two-hours': ['few-friends', 'big-team', 'own-pace'], 'group-project': 'takes-charge', 'team-sport': 'last-line',
        annoyance: 'sudden-death', festival: 'front-row', feeling: 'freedom', home: 'open-plains', patience: 'annoying',
        preferences: ['must-tank'],
      },
    },
    expect: [
      { inTop: 1, anyOf: ['druid-feral-bear', 'warrior-protection', 'paladin-protection'] },
      { inTop: 3, anyOf: ['druid-feral-bear'] },
    ],
  },
]
