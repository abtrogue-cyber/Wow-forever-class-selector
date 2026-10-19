import { describe, expect, it } from 'vitest'
import { gameData } from '../data'
import { classConstellations, constellation } from './constellations'
import { buildGalaxy, type Vec3 } from './pca'

describe('constellation', () => {
  it('joins points with the shortest lines (a minimum spanning tree)', () => {
    const points: Vec3[] = [
      [0, 0, 0],
      [10, 0, 0],
      [1, 0, 0],
      [11, 0, 0],
    ]
    expect(constellation(points)).toEqual([
      [0, 2],
      [2, 1],
      [1, 3],
    ])
  })

  it('handles empty and single-point input', () => {
    expect(constellation([])).toEqual([])
    expect(constellation([[1, 2, 3]])).toEqual([])
  })
})

describe('classConstellations', () => {
  const galaxy = buildGalaxy(gameData.builds)
  const stars = gameData.builds.map((b) => ({ classId: b.classId, pos: galaxy.stars.get(b.id)! }))
  const all = classConstellations(stars)

  it('gives every class one connected tree through all of its specs, and nothing across classes', () => {
    expect(all.map((c) => c.classId).sort()).toEqual([...new Set(stars.map((s) => s.classId))].sort())
    for (const { classId, lines } of all) {
      const members = stars.flatMap((s, i) => (s.classId === classId ? [i] : []))
      expect(lines).toHaveLength(members.length - 1)
      const reached = new Set([members[0]])
      for (let grew = true; grew; ) {
        grew = false
        for (const [a, b] of lines) {
          expect(stars[a]!.classId).toBe(classId)
          expect(stars[b]!.classId).toBe(classId)
          if (reached.has(a) !== reached.has(b)) {
            reached.add(a).add(b)
            grew = true
          }
        }
      }
      expect([...reached].sort()).toEqual(members.sort())
    }
  })
})
