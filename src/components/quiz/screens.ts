import { gameData, type Question } from '../../data'
import { raceAllowed } from '../../engine/filters'
import type { Setup } from '../../engine/types'

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
