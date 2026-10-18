import { motion, useMotionValue, useTransform } from 'motion/react'
import { useRef, useState } from 'react'
import type { Question, Wording } from '../../data'
import { en } from '../../i18n/en'
import { digitIndex, useHotkeys } from './useHotkeys'

type Value = string | string[] | undefined
type SliderQ = Extract<Question, { type: 'slider' }>
type PrioritiesQ = Extract<Question, { type: 'priorities' }>
type MultiQ = Extract<Question, { type: 'multi' }>
type SingleQ = Exclude<Question, SliderQ | PrioritiesQ | MultiQ>

type Common = {
  wording: keyof Wording
  hardcore: boolean
  value: Value
  onChange: (value: Value) => void
  /** Go to the next step. Single-choice questions call this automatically after a pick. */
  onNext: () => void
  onBack: () => void
  isLast: boolean
}

const asList = (v: Value) => (v == null ? [] : Array.isArray(v) ? v : [v])
const AUTO_ADVANCE_MS = 260
/** How far a this-or-that swipe must travel to count as a pick. */
const SWIPE_PX = 70

/** Render one question. Mount it with key={question.id} so local state resets per question. */
export function QuestionScreen({ question: q, ...common }: Common & { question: Question }) {
  const w = common.wording
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl leading-snug sm:text-3xl">{q.text[w]}</h1>
        {q.hint && <p className="mt-1 text-ash-300">{q.hint[w]}</p>}
      </div>
      {q.type === 'slider' ? (
        <SliderAnswer q={q} {...common} />
      ) : q.type === 'priorities' ? (
        <Priorities q={q} {...common} />
      ) : q.type === 'multi' ? (
        <MultiAnswer q={q} {...common} />
      ) : q.type === 'thisOrThat' ? (
        <ThisOrThat q={q} {...common} />
      ) : (
        <ChoiceList q={q} {...common} />
      )}
    </div>
  )
}

/** Pick, then move on after a short beat, once. */
function useAutoAdvance(onChange: (v: Value) => void, onNext: () => void) {
  const done = useRef(false)
  return (value: Value) => {
    if (done.current) return
    done.current = true
    onChange(value)
    window.setTimeout(onNext, AUTO_ADVANCE_MS)
  }
}

function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <button type="button" className="btn-ghost" onClick={onBack}>
      ← {en.quiz.back}
    </button>
  )
}

function Footer({ onBack, onNext, nextLabel }: { onBack: () => void; onNext: () => void; nextLabel: string }) {
  return (
    <div className="mt-2 flex items-center justify-between gap-3">
      <BackButton onBack={onBack} />
      <button type="button" className="btn-primary" onClick={onNext}>
        {nextLabel}
      </button>
    </div>
  )
}

/** Scenario and pick-one questions: tap an option and we move on. */
function ChoiceList({ q, wording: w, hardcore, value, onChange, onNext, onBack }: Common & { q: SingleQ }) {
  const pick = useAutoAdvance(onChange, onNext)
  useHotkeys((key) => {
    const option = q.options[digitIndex(key)]
    if (option) pick(option.id)
    else if (key === 'ArrowLeft') onBack()
    else if (key === 'ArrowRight' || key === 'Enter') onNext()
  })
  return (
    <>
      <div className="flex flex-col gap-2.5">
        {q.options.map((o, i) => (
          <button key={o.id} type="button" className="choice" aria-pressed={value === o.id} onClick={() => pick(o.id)}>
            <span className="kbd">{i + 1}</span>
            <span>{(hardcore && o.hardcoreLabel ? o.hardcoreLabel : o.label)[w]}</span>
          </button>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <BackButton onBack={onBack} />
        <button type="button" className="text-ash-400 underline-offset-4 hover:text-parchment-100 hover:underline" onClick={() => pick(undefined)}>
          {en.quiz.skip}
        </button>
      </div>
    </>
  )
}

/** Two big cards plus "no preference". */
function ThisOrThat({ q, wording: w, value, onChange, onNext, onBack }: Common & { q: SingleQ }) {
  const pick = useAutoAdvance(onChange, onNext)
  useHotkeys((key) => {
    if (key === '1') pick(q.options[0]?.id)
    else if (key === '2') pick(q.options[1]?.id)
    else if (key === '3') pick(undefined)
    else if (key === 'ArrowLeft') onBack()
    else if (key === 'ArrowRight' || key === 'Enter') onNext()
  })
  // Swipe toward your pick: dragging left chooses the left card, right the right card.
  const x = useMotionValue(0)
  const leftGlow = useTransform(x, [-SWIPE_PX, 0], [1, 0])
  const rightGlow = useTransform(x, [0, SWIPE_PX], [0, 1])
  return (
    <>
      <motion.div
        className="grid touch-pan-y grid-cols-2 gap-3"
        style={{ x }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.5}
        dragSnapToOrigin
        onDragEnd={(_, info) => {
          if (info.offset.x <= -SWIPE_PX) pick(q.options[0]?.id)
          else if (info.offset.x >= SWIPE_PX) pick(q.options[1]?.id)
        }}
      >
        {q.options.map((o, i) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={value === o.id}
            className="choice relative min-h-36 flex-col items-start justify-between gap-4 p-4 sm:min-h-40 sm:p-5"
            onClick={() => pick(o.id)}
          >
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[inherit] border-2 border-gold-400"
              style={{ opacity: i === 0 ? leftGlow : rightGlow }}
            />
            <span className="kbd">{i + 1}</span>
            <span className="font-display text-lg leading-snug sm:text-xl">{o.label[w]}</span>
          </button>
        ))}
      </motion.div>
      <p className="text-center text-xs text-ash-400 sm:hidden">{en.quiz.swipeHint}</p>
      <div className="mt-2 flex items-center justify-between">
        <BackButton onBack={onBack} />
        <button type="button" className="flex items-center text-ash-400 underline-offset-4 hover:text-parchment-100 hover:underline" onClick={() => pick(undefined)}>
          <span className="kbd mr-2">3</span>
          {en.quiz.noPreference}
        </button>
      </div>
    </>
  )
}

function SliderAnswer({ q, wording: w, value, onChange, onNext, onBack, isLast }: Common & { q: SliderQ }) {
  const answered = q.options.findIndex((o) => o.id === value)
  const [index, setIndex] = useState(answered >= 0 ? answered : 2)
  const current = q.options[index]
  const commit = (i: number) => {
    setIndex(i)
    onChange(q.options[i]?.id)
  }
  const next = () => {
    onChange(current?.id)
    onNext()
  }
  useHotkeys((key) => {
    const i = digitIndex(key)
    if (i >= 0 && i < q.options.length) commit(i)
    else if (key === 'ArrowLeft') onBack()
    else if (key === 'Enter' || key === 'ArrowRight') next()
  })
  return (
    <>
      <div className="panel flex flex-col gap-4 p-5">
        <input
          type="range"
          min={0}
          max={q.options.length - 1}
          step={1}
          value={index}
          onChange={(e) => commit(Number(e.target.value))}
          aria-label={q.text[w]}
          aria-valuetext={current?.label[w]}
          className="w-full accent-gold-400"
        />
        <div className="flex justify-between gap-4 text-sm text-ash-400">
          <span className="max-w-[45%]">{q.minLabel[w]}</span>
          <span className="max-w-[45%] text-right">{q.maxLabel[w]}</span>
        </div>
        <p className="text-center font-display text-lg text-gold-300" aria-live="polite">
          {current?.label[w]}
        </p>
      </div>
      <Footer onBack={onBack} onNext={next} nextLabel={isLast ? en.quiz.seeResults : en.quiz.next} />
    </>
  )
}

function Priorities({ q, wording: w, value, onChange, onNext, onBack, isLast }: Common & { q: PrioritiesQ }) {
  const picked = asList(value)
  const toggle = (id: string) => {
    if (picked.includes(id)) onChange(picked.filter((x) => x !== id))
    else if (picked.length < q.pick) onChange([...picked, id])
  }
  useHotkeys((key) => {
    const option = q.options[digitIndex(key)]
    if (option) toggle(option.id)
    else if (key === 'ArrowLeft') onBack()
    else if (key === 'Enter' || key === 'ArrowRight') onNext()
  })
  return (
    <>
      <p className="text-sm text-ash-400" aria-live="polite">
        {en.quiz.prioritiesHint(q.pick - picked.length)}
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {q.options.map((o, i) => {
          const rank = picked.indexOf(o.id)
          return (
            <button key={o.id} type="button" className="choice" aria-pressed={rank >= 0} onClick={() => toggle(o.id)}>
              <span className={rank >= 0 ? 'kbd border-gold-400 bg-gold-400 text-night-950' : 'kbd'}>{rank >= 0 ? rank + 1 : i + 1}</span>
              <span>{o.label[w]}</span>
            </button>
          )
        })}
      </div>
      <Footer onBack={onBack} onNext={onNext} nextLabel={isLast ? en.quiz.seeResults : en.quiz.next} />
    </>
  )
}

function MultiAnswer({ q, wording: w, value, onChange, onNext, onBack, isLast }: Common & { q: MultiQ }) {
  const picked = asList(value)
  const toggle = (id: string) => {
    if (picked.includes(id)) return onChange(picked.filter((x) => x !== id))
    const clashes = q.exclusive.flatMap(([a, b]) => (a === id ? [b] : b === id ? [a] : []))
    onChange([...picked.filter((x) => !clashes.includes(x)), id])
  }
  useHotkeys((key) => {
    const option = q.options[digitIndex(key)]
    if (option) toggle(option.id)
    else if (key === 'ArrowLeft') onBack()
    else if (key === 'Enter' || key === 'ArrowRight') onNext()
  })
  return (
    <>
      <div className="grid gap-2 sm:grid-cols-2">
        {q.options.map((o, i) => (
          <button key={o.id} type="button" role="checkbox" aria-checked={picked.includes(o.id)} className="choice" onClick={() => toggle(o.id)}>
            <span className="kbd">{picked.includes(o.id) ? '✓' : i + 1}</span>
            <span>{o.label[w]}</span>
          </button>
        ))}
      </div>
      <Footer onBack={onBack} onNext={onNext} nextLabel={isLast ? en.quiz.seeResults : picked.length === 0 ? en.quiz.none : en.quiz.next} />
    </>
  )
}
