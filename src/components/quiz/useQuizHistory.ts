import { useEffect } from 'react'

/** What the quiz keeps in `history.state`: the screen an entry shows, and whether it's the entry the quiz opened on. */
type QuizEntry = { quizStep?: number; quizFirst?: boolean }

const current = (): QuizEntry => (history.state && typeof history.state === 'object' ? history.state : {})

/**
 * One browser-history entry per quiz screen, so the browser's Back button (or a phone's back gesture) goes to the
 * previous question instead of leaving the quiz, and Forward comes back. The quiz's own Back button walks the same
 * entries, so the two never disagree. Behind the entry the quiz opened on (`quizFirst`) is another page, so Back
 * there changes the screen in place.
 */
export function useQuizHistory(step: number, goTo: (step: number) => void) {
  useEffect(() => {
    // The page the quiz opened on (or came back to) shows this screen.
    if (current().quizStep !== step) history.replaceState({ ...current(), quizStep: step, quizFirst: true }, '')
    // The quiz scrolls to the top of each screen itself.
    const restoration = history.scrollRestoration
    history.scrollRestoration = 'manual'
    const onPop = (e: PopStateEvent) => {
      const to = (e.state as QuizEntry | null)?.quizStep
      if (typeof to === 'number') goTo(to)
    }
    window.addEventListener('popstate', onPop)
    return () => {
      window.removeEventListener('popstate', onPop)
      history.scrollRestoration = restoration
    }
    // Once per visit: the step on screen when the quiz opened tags its first entry.
  }, [])

  return {
    /** Move ahead to a screen, with a history entry of its own. */
    forward: (to: number) => {
      goTo(to)
      history.pushState({ quizStep: to } satisfies QuizEntry, '')
    },
    /** One screen back: the browser's own Back while the entry behind is the previous screen. */
    back: () => {
      const entry = current()
      if (entry.quizStep === step && !entry.quizFirst) return history.back()
      goTo(step - 1)
      history.replaceState({ ...entry, quizStep: step - 1, quizFirst: true }, '')
    },
  }
}
