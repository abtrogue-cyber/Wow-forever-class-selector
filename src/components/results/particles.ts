import type { Build, ClassId, TagId } from '../../data'

// Particle style for the card reveal: one look per fantasy (gold motes, fel embers, frost shards…).

export type ParticlePreset = 'holy' | 'shadow' | 'fel' | 'frost' | 'fire' | 'nature' | 'arcane' | 'elements'

export const PARTICLE_STYLE: Record<ParticlePreset, { color: string; dir: 1 | 0 | -1; shape: 'dot' | 'shard' | 'ember' }> = {
  holy: { color: '#ffcf6e', dir: 1, shape: 'dot' },
  shadow: { color: '#7a5cc4', dir: 1, shape: 'dot' },
  fel: { color: '#7dff4a', dir: 1, shape: 'ember' },
  frost: { color: '#bdeeff', dir: -1, shape: 'shard' },
  fire: { color: '#ff8a3c', dir: 1, shape: 'ember' },
  nature: { color: '#c8f27a', dir: 0, shape: 'dot' },
  arcane: { color: '#c48bff', dir: 1, shape: 'shard' },
  elements: { color: '#7cc8ff', dir: 1, shape: 'shard' },
}

/** Fantasy tags that have a preset, in tie-break order. */
const TAG_PRESET: [TagId, ParticlePreset][] = [
  ['holy', 'holy'],
  ['fire', 'fire'],
  ['fel', 'fel'],
  ['frost', 'frost'],
  ['shadow', 'shadow'],
  ['arcane', 'arcane'],
  ['elements', 'elements'],
  ['nature', 'nature'],
  ['shapeshifter', 'nature'],
  ['beast', 'nature'],
]

/** Builds without a fantasy tag (e.g. Arms, Combat) fall back to their class. */
const CLASS_PRESET: Record<ClassId, ParticlePreset> = {
  warrior: 'fire',
  paladin: 'holy',
  hunter: 'nature',
  rogue: 'shadow',
  priest: 'holy',
  shaman: 'elements',
  mage: 'arcane',
  warlock: 'fel',
  druid: 'nature',
}

export function particlesFor(build: Build): ParticlePreset {
  let best: ParticlePreset | null = null
  let strength = 0
  for (const [tag, preset] of TAG_PRESET) {
    const s = build.tags[tag] ?? 0
    if (s > strength) {
      best = preset
      strength = s
    }
  }
  return best ?? CLASS_PRESET[build.classId]
}
