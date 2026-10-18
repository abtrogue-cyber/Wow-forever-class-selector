// Frozen answer layouts, one per share-code version. NEVER edit a published layout:
// if questions.json changes, add LAYOUT_V2 (and a decoder for it) and keep V1 so old links still open.

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
    { id: 'gnolls', kind: 'single', options: ['charge', 'blast', 'companion', 'vanish', 'shield'] },
    { id: 'boss-pull', kind: 'single', options: ['front', 'behind', 'melee', 'ranged', 'flex'] },
    { id: 'light-shadow', kind: 'single', options: ['light', 'shadow'] },
    { id: 'nature-arcane', kind: 'single', options: ['nature', 'arcane'] },
    { id: 'plate-robes', kind: 'single', options: ['plate', 'robes'] },
    { id: 'pet-solo', kind: 'single', options: ['pet', 'solo'] },
    { id: 'simple-complex', kind: 'single', options: ['simple', 'complex'] },
    { id: 'burst-dot', kind: 'single', options: ['burst', 'dot'] },
    { id: 'downtime', kind: 'single', options: ['fine', 'mostly-fine', 'meh', 'annoying', 'unbearable'] },
    { id: 'bad-pull', kind: 'single', options: ['escape', 'outlast', 'control', 'burn', 'graveyard'] },
    { id: 'priorities', kind: 'ranked', slots: 3, options: ['solo', 'dungeons', 'raids', 'world-pvp', 'battlegrounds', 'gold'] },
    { id: 'deal-breakers', kind: 'multi', options: ['no-pets', 'must-heal', 'must-tank', 'ranged-only', 'melee-only', 'no-stealth'] },
    { id: 'look', kind: 'single', options: ['noble', 'rugged', 'clever', 'elven', 'primal', 'eerie'] },
    { id: 'new-classic', kind: 'single', options: ['classic', 'new'] },
  ],
  axes: [
    'range', 'complexity', 'soloLeveling', 'sustain', 'survivability', 'dungeon', 'raid',
    'worldPvp', 'battlegrounds', 'goldFarming', 'groupUtility', 'petReliance', 'burst', 'armor',
  ],
}
