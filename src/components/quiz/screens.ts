import { gameData, type ClassId, type Question } from '../../data'
import { getContext } from '../../engine/context'
import { exclusionReason, raceAllowed } from '../../engine/filters'
import { buildProfile } from '../../engine/profile'
import type { Answers, Setup } from '../../engine/types'

const ctx = getContext(gameData)

/** Questions grouped into quiz screens: a question marked `withPrevious` joins the screen before it. */
export function quizScreens(questions: readonly Question[]): Question[][] {
  const screens: Question[][] = []
  for (const q of questions) {
    const last = screens[screens.length - 1]
    if (q.withPrevious && last) last.push(q)
    else screens.push([q])
  }
  return screens
}

/** Race ids the player can make with this setup (faction and Skyborne pack), in data order. */
export const racesFor = (setup: Setup): string[] => gameData.races.filter((r) => raceAllowed(r, setup)).map((r) => r.id)

/** The classes a race can be (raceClass.json), as the engine's "race in mind" filter sees them. */
export const classesFor = (raceId: string): ClassId[] => gameData.raceClass.combos.filter((c) => c.raceId === raceId).map((c) => c.classId)

/** How many builds the hard filters (setup and the last screen's direct answers) leave for the ranking. */
export function buildsLeft(answers: Answers): number {
  const profile = buildProfile(answers, ctx)
  return gameData.builds.filter((b) => !exclusionReason(b, profile, ctx)).length
}
