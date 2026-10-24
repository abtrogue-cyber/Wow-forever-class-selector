import { describe, expect, it } from 'vitest'
import { gameData } from '../../data'
import type { Vec3 } from '../../galaxy/pca'
import { AXIS_ENDS, DEFAULT_ORB, DEFAULT_TINT, driftToward, FEELING_COLOR, FEELING_TINT, LOOK_IDS, lookFor, positionFor, STARS, trailFor } from './compass'

const options = (id: string) => gameData.questions.questions.find((q) => q.id === id)?.options.map((o) => o.id) ?? []
const setup = { experience: 'played', faction: 'any', ruleset: 'normal', skyborne: 'no' } as const
const len = (p: number[]) => Math.hypot(...p)

describe('quiz compass', () => {
  it('has a star color and a sky tint for every feeling', () => {
    expect(Object.keys(FEELING_COLOR).sort()).toEqual(options(LOOK_IDS.feeling).sort())
    expect(Object.keys(FEELING_TINT).sort()).toEqual(options(LOOK_IDS.feeling).sort())
    expect(options(LOOK_IDS.novelty.question)).toContain(LOOK_IDS.novelty.option)
    expect(options(LOOK_IDS.companion.question)).toContain(LOOK_IDS.companion.option)
  })

  it('reacts to the answers that do not move the star', () => {
    const look = lookFor({ feeling: 'edge', restaurant: 'something-new', preferences: ['want-companion'] })
    expect(look).toEqual({ tint: FEELING_TINT.edge, orb: FEELING_COLOR.edge, novelty: true, companion: true })
    expect(lookFor({})).toEqual({ tint: DEFAULT_TINT, orb: DEFAULT_ORB, novelty: false, companion: false })
  })

  it('starts near the middle and moves with every answer that carries weight', () => {
    expect(len(positionFor({}, {}))).toBeLessThan(0.3)
    const trail = trailFor(setup, { festival: 'front-row', restaurant: 'something-new', packing: 'sturdy' })
    // "Try something new" only adds the novelty ring, so it adds no stop.
    expect(trail).toHaveLength(3)
    // The direct questions on the last screen rule builds out; they don't move the star either.
    expect(trailFor(setup, { festival: 'front-row', race: 'tauren', 'skip-classes': ['mage'], preferences: ['no-healing'] })).toHaveLength(2)
  })

  it('names all six ends in plain words and keeps every spec star', () => {
    expect(AXIS_ENDS).toHaveLength(3)
    for (const [neg, pos] of AXIS_ENDS) {
      expect(neg).toBeTruthy()
      expect(pos).toBeTruthy()
      expect(neg).not.toBe(pos)
    }
    expect(STARS).toHaveLength(28)
  })

  it('names the end a move heads for most, and nothing when the star stays put', () => {
    const at: Vec3 = [0.1, -0.2, 0.3]
    expect(driftToward(at, at)).toBeNull()
    expect(driftToward(at, [0.105, -0.2, 0.3])).toBeNull() // too small to add a stop to the trail
    expect(driftToward(at, [0.4, -0.25, 0.3])).toBe(AXIS_ENDS[0]![1])
    expect(driftToward(at, [0.1, -0.6, 0.4])).toBe(AXIS_ENDS[1]![0])
    expect(driftToward(at, [0.15, -0.1, 0])).toBe(AXIS_ENDS[2]![0])
    // Every stop on the trail gets a line.
    const [start, stop] = trailFor(setup, { festival: 'front-row' })
    expect(driftToward(start!, stop!)).toBeTruthy()
  })
})
