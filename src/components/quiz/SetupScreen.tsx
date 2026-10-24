import { gameData, type Wording } from '../../data'
import type { Setup } from '../../engine/types'
import { en } from '../../i18n/en'
import { isSetupComplete, useQuizStore, wordingFor } from '../../state/quizStore'
import { PickMark } from './PickMark'
import { useHotkeys } from './useHotkeys'

export function SetupScreen({ onBegin }: { onBegin: () => void }) {
  const setup = useQuizStore((s) => s.setup)
  const setSetup = useQuizStore((s) => s.setSetup)
  const w: keyof Wording = wordingFor(setup)
  const complete = isSetupComplete(setup)

  useHotkeys((key) => {
    if (key === 'Enter' && complete) onBegin()
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl sm:text-3xl">{en.quiz.setupTitle}</h1>
        <p className="mt-1 text-ash-300">{en.quiz.setupLead}</p>
      </div>
      {gameData.questions.setup.map((field) => (
        <fieldset key={field.id} className="flex flex-col gap-2">
          <legend className="mb-1 font-display text-lg text-parchment-100">{field.text[w]}</legend>
          {field.hint && <p className="-mt-1 text-sm text-ash-400">{field.hint[w]}</p>}
          <div role="radiogroup" aria-label={field.text[w]} className="grid gap-2 sm:grid-cols-2">
            {field.options.map((o) => {
              const checked = setup[field.id] === o.id
              return (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  className="choice py-3 pr-11"
                  onClick={() => setSetup(field.id, o.id as Setup[typeof field.id])}
                >
                  {o.label[w]}
                  <PickMark className="absolute top-1/2 right-3.5 -translate-y-1/2" />
                </button>
              )
            })}
          </div>
        </fieldset>
      ))}
      <div className="flex justify-end">
        <button type="button" className="btn-primary" disabled={!complete} onClick={onBegin}>
          {en.quiz.begin}
        </button>
      </div>
    </div>
  )
}
