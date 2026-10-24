import { describe, expect, it } from 'vitest'
import { gameData } from '../../data'
import { PERSONAS } from '../../engine/personas'
import { rank } from '../../engine/rank'
import type { Answers } from '../../engine/types'
import { buildsLeft, classesFor } from './screens'

const ANY = { experience: 'played', faction: 'any', ruleset: 'normal', skyborne: 'yes' } as const

describe('quiz screen helpers', () => {
  it("counts exactly the builds the ranking keeps (the last screen's live count)", () => {
    const lastScreen: Answers['picks'][] = [
      {},
      { preferences: ['no-healing', 'no-tanking'] },
      { race: 'tauren', 'skip-classes': ['warrior'] },
      { preferences: ['must-heal', 'ranged-only'], 'skip-classes': ['priest'] },
      { race: 'tauren', 'skip-classes': classesFor('tauren') },
    ]
    for (const persona of PERSONAS) {
      for (const extra of lastScreen) {
        const answers = { ...persona.answers, picks: { ...persona.answers.picks, ...extra } }
        expect(buildsLeft(answers)).toBe(rank(answers, gameData).results.length)
      }
    }
    // Skipping every class the race in mind can be leaves nothing.
    expect(buildsLeft({ setup: ANY, picks: { race: 'tauren', 'skip-classes': classesFor('tauren') } })).toBe(0)
  })

  it('greys out exactly the classes the ranking rules out for each race in mind', () => {
    for (const race of gameData.races) {
      const { excluded } = rank({ setup: ANY, picks: { race: race.id } }, gameData)
      const ruledOut = new Set(excluded.filter((e) => e.reason === 'wrongRace').map((e) => gameData.builds.find((b) => b.id === e.buildId)!.classId))
      const greyed = gameData.classes.map((c) => c.id).filter((id) => !classesFor(race.id).includes(id))
      expect([...ruledOut].sort(), race.id).toEqual(greyed.sort())
    }
  })
})
