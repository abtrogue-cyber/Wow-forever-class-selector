import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Wording } from '../data/schemas'
import type { Answers, Setup } from '../engine/types'

type QuizState = {
  setup: Partial<Setup>
  picks: Answers['picks']
  /** 0 = setup screen, 1…N = questions. */
  step: number
  setSetup: <K extends keyof Setup>(field: K, value: Setup[K]) => void
  setPick: (questionId: string, value: string | string[] | undefined) => void
  goTo: (step: number) => void
  reset: () => void
}

/** sessionStorage can throw (private mode, blocked storage): fall back to memory only. */
const safeSession = createJSONStorage(() => {
  try {
    const s = window.sessionStorage
    s.setItem('__fm', '1')
    s.removeItem('__fm')
    return s
  } catch {
    const memory = new Map<string, string>()
    return {
      getItem: (k: string) => memory.get(k) ?? null,
      setItem: (k: string, v: string) => void memory.set(k, v),
      removeItem: (k: string) => void memory.delete(k),
    }
  }
})

export const useQuizStore = create<QuizState>()(
  persist(
    (set) => ({
      setup: {},
      picks: {},
      step: 0,
      setSetup: (field, value) => set((s) => ({ setup: { ...s.setup, [field]: value } })),
      setPick: (id, value) =>
        set((s) => {
          const picks = { ...s.picks }
          if (value === undefined || (Array.isArray(value) && value.length === 0)) delete picks[id]
          else picks[id] = value
          return { picks }
        }),
      goTo: (step) => set({ step }),
      reset: () => set({ setup: {}, picks: {}, step: 0 }),
    }),
    { name: 'forever-main-quiz', storage: safeSession, version: 1 },
  ),
)

export function isSetupComplete(setup: Partial<Setup>): setup is Setup {
  return !!(setup.experience && setup.faction && setup.ruleset && setup.skyborne)
}

/** Newcomer wording for "New to WoW" (and before anything is chosen), veteran otherwise. */
export function wordingFor(setup: Partial<Setup>): keyof Wording {
  return setup.experience && setup.experience !== 'new' ? 'veteran' : 'newcomer'
}
