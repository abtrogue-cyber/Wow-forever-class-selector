import { AXIS_IDS, SETUP_OPTIONS } from '../data/vocab'
import type { GameData } from '../data/schemas'
import type { Answers, TweakLevel } from './types'

/** Small deterministic PRNG for reproducible random players in tests. */
export function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** A random but valid set of answers (some questions skipped, some tweaks). */
export function randomAnswers(seed: number, data: GameData): Answers {
  const rnd = mulberry32(seed)
  const one = <T>(arr: readonly T[]): T => arr[Math.floor(rnd() * arr.length)] as T
  const answers: Answers = {
    setup: {
      experience: one(SETUP_OPTIONS.experience),
      faction: one(SETUP_OPTIONS.faction),
      ruleset: one(SETUP_OPTIONS.ruleset),
      skyborne: one(SETUP_OPTIONS.skyborne),
    },
    picks: {},
  }
  for (const q of data.questions.questions) {
    if (rnd() < 0.15) continue
    if (q.type === 'priorities') {
      const ids = q.options.map((o) => o.id).sort(() => rnd() - 0.5)
      answers.picks[q.id] = ids.slice(0, Math.floor(rnd() * (q.pick + 1)))
    } else if (q.type === 'multi') {
      const ids = q.options.filter(() => rnd() < 0.15).map((o) => o.id)
      answers.picks[q.id] = ids.filter((id) => !q.exclusive.some(([a, b]) => id === b && ids.includes(a)))
    } else if (q.type === 'skipClasses') {
      answers.picks[q.id] = q.options.filter(() => rnd() < 0.1).map((o) => o.id)
    } else if (q.type === 'race') {
      // Most players let the racials decide; some name a race, which may not fit their faction (then it's ignored).
      if (rnd() < 0.4) answers.picks[q.id] = one(q.options).id
    } else {
      answers.picks[q.id] = one(q.options).id
    }
  }
  if (rnd() < 0.3) {
    answers.tweaks = {}
    for (let i = 0; i < 3; i++) answers.tweaks[one(AXIS_IDS)] = Math.floor(rnd() * 8) as TweakLevel
  }
  return answers
}
