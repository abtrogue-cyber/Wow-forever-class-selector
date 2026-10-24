import type { ClassId } from '../data/schemas'
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
  /**
   * Looser match % checks for a persona that can't meet the default ones (#1 at 85% or more, #10 at least 15 points
   * lower, median build at 70% or less), with the reason. Everyone else keeps the defaults.
   */
  match?: { minTop?: number; minGap?: number; maxMedian?: number; why: string }
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
        feeling: 'calm', restaurant: 'usual', patience: 'kind-of-nice', preferences: ['must-heal'],
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
        annoyance: 'sudden-death', stuck: 'come-back', festival: 'overview', feeling: 'freedom',
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
        patience: 'annoying', preferences: [],
      },
    },
    expect: [
      { inTop: 2, anyOf: ['rogue-subtlety'] },
      { inTop: 4, anyOf: ['rogue-assassination', 'druid-feral-cat', 'rogue-combat'] },
    ],
    match: { minGap: 10, maxMedian: 80, why: 'Many melee PvP builds fit a world-PvP ganker almost as well (D48).' },
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
        feeling: 'counted-on', restaurant: 'something-new', patience: 'annoying', preferences: [],
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
        annoyance: 'sudden-death', wins: 'big-moment', festival: 'overview', feeling: 'freedom',
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
        restaurant: 'something-new', patience: 'annoying', preferences: ['must-heal'],
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
        annoyance: 'not-mattering', wins: 'big-moment', festival: 'overview', feeling: 'freedom',
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
        annoyance: 'sudden-death', festival: 'front-row', feeling: 'freedom', patience: 'annoying',
        preferences: ['must-tank'],
      },
    },
    expect: [
      { inTop: 1, anyOf: ['druid-feral-bear', 'warrior-protection', 'paladin-protection'] },
      { inTop: 3, anyOf: ['druid-feral-bear'] },
    ],
  },
]

/**
 * One fan per class, answering the person-first quiz the way a typical player of that class would (no hard
 * filters, no race, no skipped classes; the companion tick only where the class lives with a pet or demon).
 * D30's check, rebuilt for the balance report (the original players weren't saved): each fan should find a
 * build of their class in the top 3.
 */
export type ClassFan = { classId: ClassId; label: string; answers: Answers }

const fan = (picks: Answers['picks']): Answers => ({
  setup: { experience: 'played', faction: 'any', ruleset: 'normal', skyborne: 'no' },
  picks,
})

export const CLASS_FANS: ClassFan[] = [
  {
    classId: 'warrior', label: 'Charges in, hits hard, wears plate',
    answers: fan({
      'two-hours': ['few-friends', 'big-team', 'fair-match'], 'group-project': 'hardest-part', 'team-sport': 'scorer',
      annoyance: 'not-mattering', wins: 'big-moment', stuck: 'try-harder', festival: 'front-row', packing: 'sturdy',
      feeling: 'close-call', restaurant: 'usual', patience: 'agony',
    }),
  },
  {
    classId: 'paladin', label: 'Holy knight who protects the group',
    answers: fan({
      'two-hours': ['few-friends', 'big-team', 'own-pace'], 'group-project': 'takes-charge', 'team-sport': 'last-line',
      annoyance: 'sudden-death', wins: 'slow-certain', stuck: 'ask-friends', festival: 'front-row', packing: 'sturdy',
      feeling: 'counted-on', restaurant: 'something-new', patience: 'kind-of-nice',
    }),
  },
  {
    classId: 'hunter', label: 'Roams alone with a pet, shoots from afar',
    answers: fan({
      'two-hours': ['own-pace', 'fortune', 'rivals'], 'group-project': 'own-part', 'team-sport': 'solo-sport',
      annoyance: 'depending', wins: 'outsmart', stuck: 'come-back', festival: 'overview', packing: 'practical',
      feeling: 'freedom', restaurant: 'usual', patience: 'annoying', preferences: ['want-companion'],
    }),
  },
  {
    classId: 'rogue', label: 'Sneaky opportunist who hunts other players',
    answers: fan({
      'two-hours': ['rivals', 'fortune', 'few-friends'], 'group-project': 'own-part', 'team-sport': 'scorer',
      annoyance: 'depending', wins: 'outsmart', stuck: 'look-it-up', festival: 'roaming', packing: 'light',
      feeling: 'edge', restaurant: 'usual', patience: 'agony',
    }),
  },
  {
    classId: 'priest', label: 'Calm healer behind the group',
    answers: fan({
      'two-hours': ['few-friends', 'big-team', 'own-pace'], 'group-project': 'nobody-behind', 'team-sport': 'playmaker',
      annoyance: 'not-mattering', wins: 'unnoticed', stuck: 'ask-friends', festival: 'backstage', packing: 'light',
      feeling: 'calm', restaurant: 'usual', patience: 'half-the-fun',
    }),
  },
  {
    classId: 'shaman', label: 'Elemental all-rounder who fills any gap',
    answers: fan({
      'two-hours': ['fair-match', 'few-friends', 'own-pace'], 'group-project': 'fills-gaps', 'team-sport': 'playmaker',
      annoyance: 'not-mattering', wins: 'big-moment', stuck: 'try-harder', festival: 'roaming', packing: 'practical',
      feeling: 'wonder', restaurant: 'something-new', patience: 'agony',
    }),
  },
  {
    classId: 'mage', label: 'Clever caster who loves big numbers',
    answers: fan({
      'two-hours': ['big-team', 'fortune', 'fair-match'], 'group-project': 'hardest-part', 'team-sport': 'scorer',
      annoyance: 'not-mattering', wins: 'big-moment', stuck: 'look-it-up', festival: 'overview', packing: 'light',
      feeling: 'wonder', restaurant: 'usual', patience: 'agony',
    }),
  },
  {
    classId: 'warlock', label: 'Patient dark caster with a demon',
    answers: fan({
      'two-hours': ['own-pace', 'rivals', 'fortune'], 'group-project': 'own-part', 'team-sport': 'solo-sport',
      annoyance: 'waiting', wins: 'slow-certain', stuck: 'come-back', festival: 'overview', packing: 'light',
      feeling: 'edge', restaurant: 'usual', patience: 'half-the-fun', preferences: ['want-companion'],
    }),
  },
  {
    classId: 'druid', label: 'Shapeshifter who loves nature and freedom',
    answers: fan({
      'two-hours': ['own-pace', 'few-friends', 'fortune'], 'group-project': 'fills-gaps', 'team-sport': 'playmaker',
      annoyance: 'depending', wins: 'outsmart', stuck: 'come-back', festival: 'roaming', packing: 'practical',
      feeling: 'freedom', restaurant: 'something-new', patience: 'fine',
    }),
  },
]
