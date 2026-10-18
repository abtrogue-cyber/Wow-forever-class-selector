import { describe, expect, it } from 'vitest'
import { gameData } from '../../data'
import { AXIS_ENDS, FEELING_COLOR, HOME_TINT, LOOK_IDS, lookFor, positionFor, STARS, trailFor } from './compass'

const options = (id: string) => gameData.questions.questions.find((q) => q.id === id)?.options.map((o) => o.id) ?? []
const setup = { experience: 'played', faction: 'any', ruleset: 'normal', skyborne: 'no' } as const
const len = (p: number[]) => Math.hypot(...p)

describe('quiz compass', () => {
  it('has a sky tint for every place and a star color for every feeling', () => {
    expect(Object.keys(HOME_TINT).sort()).toEqual(options(LOOK_IDS.home).sort())
    expect(Object.keys(FEELING_COLOR).sort()).toEqual(options(LOOK_IDS.feeling).sort())
    expect(options(LOOK_IDS.novelty.question)).toContain(LOOK_IDS.novelty.option)
    expect(options(LOOK_IDS.companion.question)).toContain(LOOK_IDS.companion.option)
  })

  it('reacts to the answers that do not move the star', () => {
    const look = lookFor({ home: 'moon-forest', feeling: 'edge', restaurant: 'something-new', preferences: ['want-companion'] })
    expect(look).toEqual({ tint: HOME_TINT['moon-forest'], orb: FEELING_COLOR.edge, novelty: true, companion: true })
    expect(lookFor({}).novelty).toBe(false)
  })

  it('starts near the middle and moves with every answer that carries weight', () => {
    expect(len(positionFor({}, {}))).toBeLessThan(0.3)
    const trail = trailFor(setup, { festival: 'front-row', home: 'misty-ruins', packing: 'sturdy' })
    // The place to live only changes the look, so it adds no stop.
    expect(trail).toHaveLength(3)
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
})
