import { useState } from 'react'
import { gameData, type SetupField, type Wording } from '../../data'
import type { Setup } from '../../engine/types'
import { en } from '../../i18n/en'
import { useQuizStore, wordingFor } from '../../state/quizStore'
import { PickMark } from './PickMark'
import { useHotkeys } from './useHotkeys'

/** Answers this short fit three to a row even on a phone. */
const COMPACT_LABEL = 14

/** Fields of three get three columns (short answers on phones too), others two: no tile is left alone on a row. */
function columns(field: SetupField, w: keyof Wording): { grid: string; compact: boolean } {
  if (field.options.length % 3 !== 0) return { grid: 'sm:grid-cols-2', compact: false }
  const compact = field.options.every((o) => o.label[w].length <= COMPACT_LABEL)
  return { grid: compact ? 'grid-cols-3' : 'sm:grid-cols-3', compact }
}

export function SetupScreen({ onBegin }: { onBegin: () => void }) {
  const setup = useQuizStore((s) => s.setup)
  const setSetup = useQuizStore((s) => s.setSetup)
  // The wording is set when the screen opens: picking your experience used to re-word the whole form (the very button
  // you'd tapped included). The questions after it use the wording that fits.
  const [w] = useState<keyof Wording>(() => wordingFor(setup))
  const missing = gameData.questions.setup.filter((field) => !setup[field.id])
  // Begin with a choice still missing says which ones, and takes you to the first.
  const [asked, setAsked] = useState(false)
  const begin = () => {
    const first = missing[0]
    if (!first) return onBegin()
    setAsked(true)
    document.getElementById(`setup-${first.id}`)?.querySelector<HTMLElement>('[role="radio"]')?.focus()
  }

  useHotkeys((key) => {
    if (key === 'Enter') begin()
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl sm:text-3xl">{en.quiz.setupTitle}</h1>
        <p className="mt-1 text-ash-300">{en.quiz.setupLead}</p>
      </div>
      {gameData.questions.setup.map((field) => {
        const { grid, compact } = columns(field, w)
        return (
          <fieldset key={field.id} id={`setup-${field.id}`} className="flex flex-col gap-2">
            <legend className="mb-1 font-display text-lg text-parchment-100">
              {field.text[w]}
              {/* Begin pressed early scrolls up to here, away from the note by the button: mark the field itself too. */}
              {asked && !setup[field.id] && <span className="ml-2 inline-block font-body text-sm whitespace-nowrap text-ember-400">{en.quiz.setupStill}</span>}
            </legend>
            {field.hint && <p className="-mt-1 text-sm text-ash-400">{field.hint[w]}</p>}
            <div role="radiogroup" aria-label={field.text[w]} className={`grid gap-2 ${grid}`}>
              {field.options.map((o) => {
                const checked = setup[field.id] === o.id
                return (
                  <button
                    key={o.id}
                    type="button"
                    role="radio"
                    aria-checked={checked}
                    className={`choice py-3 ${compact ? 'justify-center px-2 text-center' : ''}`}
                    onClick={() => setSetup(field.id, o.id as Setup[typeof field.id])}
                  >
                    {o.label[w]}
                    {/* On the corner, so tiles three to a row keep their whole width for the text. */}
                    <PickMark className="absolute -top-1.5 -right-1.5 size-4" />
                  </button>
                )
              })}
            </div>
          </fieldset>
        )
      })}
      <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
        <p className="text-right text-sm text-ember-400" aria-live="polite">
          {asked && missing.length > 0 ? en.quiz.setupMissing(missing.map((field) => en.quiz.setupFields[field.id])) : ''}
        </p>
        {/* Not `disabled`: a disabled button can't be focused or pressed, so it couldn't say what's missing. */}
        <button type="button" className="btn-primary" aria-disabled={missing.length > 0 || undefined} onClick={begin}>
          {en.quiz.begin}
        </button>
      </div>
    </div>
  )
}
