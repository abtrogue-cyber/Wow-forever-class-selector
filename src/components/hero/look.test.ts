import { describe, expect, it } from 'vitest'
import { gameData } from '../../data'
import { getContext } from '../../engine/context'
import { lookFor } from './look'

const ctx = getContext(gameData)
const look = (id: string) => {
  const build = ctx.builds.get(id)!
  return lookFor(build, ctx.classes.get(build.classId)!)
}

describe('hero look', () => {
  it('gives every build a look in its class color', () => {
    for (const b of gameData.builds) expect(look(b.id).color).toBe(ctx.classes.get(b.classId)!.colorHex)
  })

  it('picks a weapon a WoW player would expect', () => {
    expect(look('warrior-protection').weapon).toBe('blade-shield')
    expect(look('paladin-retribution').weapon).toBe('blade')
    expect(look('hunter-marksmanship').weapon).toBe('bow')
    expect(look('hunter-survival').weapon).toBe('blade')
    expect(look('rogue-combat').weapon).toBe('daggers')
    expect(look('mage-frost').weapon).toBe('staff')
    expect(look('shaman-enhancement').weapon).toBe('blade')
    expect(look('priest-holy').weapon).toBe('staff')
  })

  it('takes particles from the strongest fantasy tag, else the class', () => {
    expect(look('mage-frost').particles).toBe('frost')
    expect(look('warlock-demonology').particles).toBe('fel')
    expect(look('warlock-destruction').particles).toBe('fire') // fire, fel and shadow tie: fire wins
    expect(look('druid-feral-cat').particles).toBe('nature') // shapeshifter → nature
    expect(look('warrior-arms').particles).toBe('fire') // no fantasy tag → class default
    expect(look('rogue-combat').particles).toBe('shadow')
  })

  it('maps armor type to bulk', () => {
    expect(look('mage-arcane').armor).toBeLessThan(look('rogue-subtlety').armor)
    expect(look('rogue-subtlety').armor).toBeLessThan(look('shaman-elemental').armor)
    expect(look('shaman-elemental').armor).toBeLessThan(look('paladin-holy').armor)
  })
})
