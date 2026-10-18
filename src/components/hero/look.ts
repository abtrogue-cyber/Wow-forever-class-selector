import type { Build, ClassId, GameClass, TagId } from '../../data'

// What the forming hero looks like for a given build: glow color, armor bulk, weapon and particle preset.
// Shared by the 3D scene and the 2D fallback. Our own stylized choices, no game assets.

export type Weapon = 'blade' | 'blade-shield' | 'staff' | 'bow' | 'daggers'
export type ParticlePreset = 'holy' | 'shadow' | 'fel' | 'frost' | 'fire' | 'nature' | 'arcane' | 'elements'
export type HeroLook = {
  /** Class color (hex). */
  color: string
  /** 0 = cloth … 1 = plate. */
  armor: number
  weapon: Weapon
  particles: ParticlePreset
}

/** Particle color and motion per preset, shared by the 3D motes and the 2D reveal burst. */
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

export const GOLD = '#f5c86b'
export const DEFAULT_LOOK: HeroLook = { color: GOLD, armor: 0.5, weapon: 'blade', particles: 'holy' }

const ARMOR: Record<GameClass['armor'], number> = { cloth: 0.1, leather: 0.4, mail: 0.65, plate: 1 }

/** Fantasy tags that have a particle preset, in tie-break order. */
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

export function weaponFor(build: Build): Weapon {
  if (build.classId === 'rogue') return 'daggers'
  if (build.classId === 'druid') return 'staff'
  if (build.role === 'tank') return 'blade-shield'
  if (build.classId === 'hunter') return build.axes.range >= 3 ? 'bow' : 'blade'
  if (build.role === 'healer' || build.axes.range >= 3) return 'staff'
  return 'blade'
}

export function lookFor(build: Build, cls: GameClass): HeroLook {
  return { color: cls.colorHex, armor: ARMOR[cls.armor], weapon: weaponFor(build), particles: particlesFor(build) }
}
