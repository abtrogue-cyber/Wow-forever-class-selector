import { useEffect, useRef } from 'react'

/** Global key handler that stays out of the way of text fields, selects and sliders. */
export function useHotkeys(handler: (key: string, event: KeyboardEvent) => void) {
  const ref = useRef(handler)
  ref.current = handler
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.repeat) return
      const t = e.target
      if (t instanceof HTMLInputElement && t.type !== 'checkbox' && t.type !== 'radio') return
      if (t instanceof HTMLTextAreaElement || t instanceof HTMLSelectElement) return
      // Enter on a focused button or link belongs to that control (pick this answer, tick this box). Acting on it
      // here too made one key press do two things: skip the question unanswered, or untick a box and finish.
      if (e.key === 'Enter' && t instanceof Element && t.closest('button, a[href]')) return
      ref.current(e.key, e)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}

/** "1" → 0, "2" → 1 … or -1. */
export const digitIndex = (key: string) => (/^[1-9]$/.test(key) ? Number(key) - 1 : -1)
