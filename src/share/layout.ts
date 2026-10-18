// Frozen answer layouts, one per share-code version. NEVER edit a published layout:
// if questions.json changes, add LAYOUT_V2 (and a decoder for it) and keep V1 so old links still open.
// (V1 was rewritten once, for the person-first quiz, before anything was deployed: no v1 links existed yet.)

export type LayoutQuestion =
  | { id: string; kind: 'single'; options: readonly string[] }
  | { id: string; kind: 'ranked'; slots: number; options: readonly string[] }
  | { id: string; kind: 'multi'; options: readonly string[] }

export type Layout = {
  setup: {
    experience: readonly string[]
    faction: readonly string[]
    ruleset: readonly string[]
    skyborne: readonly string[]
  }
  questions: readonly LayoutQuestion[]
  /** Axis order for tweak sliders. */
  axes: readonly string[]
}

export const LAYOUT_V1: Layout = {
  setup: {
    experience: ['new', 'played', 'veteran'],
    faction: ['alliance', 'horde', 'any'],
    ruleset: ['normal', 'pvp', 'rp', 'hardcore'],
    skyborne: ['yes', 'no', 'unsure'],
  },
  questions: [
    { id: 'two-hours', kind: 'ranked', slots: 3, options: ['own-pace', 'few-friends', 'big-team', 'fair-match', 'rivals', 'fortune'] },
    { id: 'group-project', kind: 'single', options: ['takes-charge', 'nobody-behind', 'hardest-part', 'fills-gaps', 'own-part'] },
    { id: 'team-sport', kind: 'single', options: ['last-line', 'playmaker', 'scorer', 'captain', 'solo-sport'] },
    { id: 'annoyance', kind: 'single', options: ['waiting', 'sudden-death', 'depending', 'not-mattering', 'too-much'] },
    { id: 'wins', kind: 'single', options: ['big-moment', 'slow-certain', 'unnoticed', 'outsmart'] },
    { id: 'stuck', kind: 'single', options: ['try-harder', 'look-it-up', 'ask-friends', 'come-back'] },
    { id: 'festival', kind: 'single', options: ['front-row', 'overview', 'roaming', 'backstage'] },
    { id: 'packing', kind: 'single', options: ['sturdy', 'light', 'practical', 'improvise'] },
    { id: 'feeling', kind: 'single', options: ['calm', 'close-call', 'wonder', 'counted-on', 'edge', 'freedom'] },
    { id: 'home', kind: 'single', options: ['stone-city', 'mountain-hall', 'workshop', 'moon-forest', 'open-plains', 'misty-ruins', 'sky-island'] },
    { id: 'restaurant', kind: 'single', options: ['usual', 'something-new'] },
    { id: 'patience', kind: 'single', options: ['agony', 'annoying', 'fine', 'kind-of-nice', 'half-the-fun'] },
    { id: 'preferences', kind: 'multi', options: ['want-companion', 'no-pets', 'must-heal', 'must-tank', 'ranged-only', 'melee-only', 'no-stealth'] },
  ],
  axes: [
    'range', 'complexity', 'soloLeveling', 'sustain', 'survivability', 'dungeon', 'raid',
    'worldPvp', 'battlegrounds', 'goldFarming', 'groupUtility', 'petReliance', 'burst', 'armor',
  ],
}
