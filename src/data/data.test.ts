import { describe, expect, it } from 'vitest'
import { rawData } from './raw'
import { GameDataSchema } from './schemas'
import { findDataProblems, parseGameData } from './validate'

describe('game data', () => {
  it('matches the Zod schemas', () => {
    const result = GameDataSchema.safeParse(rawData)
    expect(result.success ? [] : result.error.issues).toEqual([])
  })

  it('passes the cross-reference checks', () => {
    const data = GameDataSchema.parse(rawData)
    expect(findDataProblems(data)).toEqual([])
  })

  it('has the expected shape', () => {
    const data = parseGameData(rawData)
    expect(data.classes).toHaveLength(9)
    expect(data.builds).toHaveLength(28)
    expect(data.races).toHaveLength(10)
    expect(data.questions.questions).toHaveLength(14)
  })

  it('matches the race/class matrix in docs/RESEARCH.md §4', () => {
    const data = parseGameData(rawData)
    const classesOf = (raceId: string) =>
      data.raceClass.combos.filter((c) => c.raceId === raceId).map((c) => c.classId + (c.newInForever ? '*' : '')).sort()
    expect(classesOf('human')).toEqual(['hunter*', 'mage', 'paladin', 'priest', 'rogue', 'warlock', 'warrior'])
    expect(classesOf('dwarf')).toEqual(['hunter', 'paladin', 'priest', 'rogue', 'shaman*', 'warrior'])
    expect(classesOf('gnome')).toEqual(['mage', 'priest*', 'rogue', 'warlock', 'warrior'])
    expect(classesOf('night-elf')).toEqual(['druid', 'hunter', 'priest', 'rogue', 'warrior'])
    expect(classesOf('orc')).toEqual(['hunter', 'mage*', 'rogue', 'shaman', 'warlock', 'warrior'])
    expect(classesOf('undead')).toEqual(['mage', 'paladin*', 'priest', 'rogue', 'warlock', 'warrior'])
    expect(classesOf('tauren')).toEqual(['druid', 'hunter', 'shaman', 'warrior'])
    expect(classesOf('troll')).toEqual(['hunter', 'mage', 'priest', 'rogue', 'shaman', 'warlock*', 'warrior'])
    expect(classesOf('skyborne-high-order')).toEqual(['druid*', 'hunter*', 'mage*', 'rogue*', 'warrior*'])
    expect(classesOf('skyborne-windshaper')).toEqual(['druid*', 'hunter*', 'rogue*', 'shaman*', 'warrior*'])
  })
})
