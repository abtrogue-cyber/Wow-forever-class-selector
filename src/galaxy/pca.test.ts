import { describe, expect, it } from 'vitest'
import { AXIS_IDS, gameData } from '../data'
import { getContext } from '../engine/context'
import { buildProfile } from '../engine/profile'
import { buildGalaxy, playerAxes } from './pca'

const galaxy = buildGalaxy(gameData.builds)
const vec = (c: Record<string, number>) => AXIS_IDS.map((a) => c[a] ?? 0)

describe('spec galaxy (PCA)', () => {
  it('places every build within ±1 and is deterministic', () => {
    expect(galaxy.stars.size).toBe(28)
    for (const p of galaxy.stars.values()) for (const x of p) expect(Math.abs(x)).toBeLessThanOrEqual(1 + 1e-9)
    expect([...buildGalaxy(gameData.builds).stars]).toEqual([...galaxy.stars])
  })

  it('finds orthonormal directions, strongest first', () => {
    const [a, b, c] = galaxy.components.map(vec) as [number[], number[], number[]]
    const dot = (x: number[], y: number[]) => x.reduce((s, v, i) => s + v * y[i]!, 0)
    expect(dot(a, a)).toBeCloseTo(1, 6)
    expect(dot(a, b)).toBeCloseTo(0, 6)
    expect(dot(b, c)).toBeCloseTo(0, 6)
    expect(galaxy.explained[0]!).toBeGreaterThanOrEqual(galaxy.explained[1]!)
    expect(galaxy.explained[1]!).toBeGreaterThanOrEqual(galaxy.explained[2]!)
  })

  it('projects a build onto its own star', () => {
    const b = gameData.builds.find((x) => x.id === 'mage-frost')!
    const p = galaxy.project(b.axes)
    const star = galaxy.stars.get('mage-frost')!
    p.forEach((x, i) => expect(x).toBeCloseTo(star[i]!, 9))
  })

  it('puts look-alike builds next to each other', () => {
    expect(galaxy.neighbors('priest-holy', 2)).toContain('priest-discipline')
    expect(galaxy.neighbors('mage-fire', 3)).toContain('mage-arcane')
    expect(galaxy.neighbors('warrior-protection', 3)).toContain('paladin-protection')
    expect(galaxy.neighbors('rogue-combat', 3)).not.toContain('rogue-combat')
  })
})

describe('player position', () => {
  const neutral = buildProfile({ setup: { experience: 'played', faction: 'any', ruleset: 'normal', skyborne: 'no' }, picks: {} }, getContext(gameData))
  const withRange = (weight: number) => ({ ...neutral, axes: { ...neutral.axes, range: { target: 5, weight } } })
  const mean = gameData.builds.reduce((s, b) => s + b.axes.range, 0) / gameData.builds.length

  it('sits on the average build where you expressed nothing', () => {
    expect(playerAxes(neutral, gameData.builds).range).toBeCloseTo(mean, 9)
  })

  it('is pulled toward your target, further the more your answers weigh', () => {
    const light = playerAxes(withRange(0.25), gameData.builds).range
    const heavy = playerAxes(withRange(3), gameData.builds).range
    expect(light).toBeCloseTo(mean + (5 - mean) / 2, 9) // weight = PULL_HALFWAY → halfway
    expect(heavy).toBeGreaterThan(light)
    expect(heavy).toBeLessThan(5)
  })
})
