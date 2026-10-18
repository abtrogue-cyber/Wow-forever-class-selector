import { describe, expect, it } from 'vitest'
import { gameData } from '../../data'
import { particlesFor } from './particles'

const preset = (id: string) => particlesFor(gameData.builds.find((b) => b.id === id)!)

describe('reveal particles', () => {
  it('takes the strongest fantasy tag, else the class', () => {
    expect(preset('mage-frost')).toBe('frost')
    expect(preset('warlock-demonology')).toBe('fel')
    expect(preset('warlock-destruction')).toBe('fire') // fire, fel and shadow tie: fire wins
    expect(preset('druid-feral-cat')).toBe('nature') // shapeshifter → nature
    expect(preset('warrior-arms')).toBe('fire') // no fantasy tag → class default
    expect(preset('rogue-combat')).toBe('shadow')
  })
})
