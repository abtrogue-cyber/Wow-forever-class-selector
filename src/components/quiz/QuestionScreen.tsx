import { motion, useMotionValue, useTransform } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { gameData, type ClassId, type Question, type Wording } from '../../data'
import type { Answers, Setup } from '../../engine/types'
import { en } from '../../i18n/en'
import { ClassGlyph } from '../icons/Glyphs'
import { PickMark } from './PickMark'
import { buildsLeft, classesFor, racesFor } from './screens'
import { digitIndex, useHotkeys } from './useHotkeys'

type Value = string | string[] | undefined
type SliderQ = Extract<Question, { type: 'slider' }>
type PrioritiesQ = Extract<Question, { type: 'priorities' }>
type MultiQ = Extract<Question, { type: 'multi' }>
type RaceQ = Extract<Question, { type: 'race' }>
type SkipClassesQ = Extract<Question, { type: 'skipClasses' }>
type SingleQ = Extract<Question, { type: 'scenario' | 'thisOrThat' | 'pickOne' }>
/** The race picked under "Got a race in mind?", for the class chips on the same screen. */
type RaceInMind = { id: string; label: string }

type Common = {
  wording: keyof Wording
  hardcore: boolean
  value: Value
  onChange: (value: Value) => void
  /** Go to the next step. Single-choice questions call this automatically after a pick. */
  onNext: () => void
  onBack: () => void
  isLast: boolean
  /** Pointer or keyboard focus on an option previews its answer (null: nothing previewed). */
  onPreview?: (preview: { value: Value } | null) => void
  /** The setup decides which races can be picked. Without one, every race can. */
  setup?: Setup
}

const ANY_SETUP: Setup = { experience: 'played', faction: 'any', ruleset: 'normal', skyborne: 'yes' }

const asList = (v: Value) => (v == null ? [] : Array.isArray(v) ? v : [v])

/** Hover and focus handlers that preview an answer before it's picked (the compass shows where it leads). */
const previewOn = (onPreview: Common['onPreview'], value: () => Value) =>
  onPreview
    ? {
        onMouseEnter: () => onPreview({ value: value() }),
        onMouseLeave: () => onPreview(null),
        onFocus: () => onPreview({ value: value() }),
        onBlur: () => onPreview(null),
      }
    : {}
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
      ) : q.type === 'race' || q.type === 'skipClasses' ? (
        <>
          <DirectAnswer q={q} {...common} />
          <Footer onBack={common.onBack} onNext={common.onNext} nextLabel={common.isLast ? en.quiz.seeResults : en.quiz.next} stacked={common.isLast} />
        </>
      ) : q.type === 'thisOrThat' ? (
        <ThisOrThat q={q} {...common} />
      ) : (
        <ChoiceList q={q} {...common} />
      )}
    </div>
  )
}

type GroupProps = Omit<Common, 'value' | 'onChange' | 'onPreview'> & {
  questions: Question[]
  values: Record<string, Value | null>
  onChange: (questionId: string, value: Value) => void
  onPreview?: (preview: { questionId: string; value: Value } | null) => void
}

/**
 * Several questions on one screen: the last one asks the direct questions (hard preferences, a race in mind,
 * classes to skip). The first question titles the screen; each other one gets its own section.
 */
export function QuestionGroup({ questions, values, onChange, onPreview, ...common }: GroupProps) {
  const { wording: w, onNext, onBack, isLast } = common
  const [first, ...rest] = questions
  const answer = (q: Question) => ({
    ...common,
    value: values[q.id] ?? undefined,
    onChange: (v: Value) => onChange(q.id, v),
    onPreview: onPreview && ((p: { value: Value } | null) => onPreview(p && { questionId: q.id, value: p.value })),
  })
  const ticks = first?.type === 'multi' ? first : undefined
  useHotkeys((key) => {
    const option = ticks?.options[digitIndex(key)]
    if (ticks && option) answer(ticks).onChange(toggledTick(ticks, asList(values[ticks.id] ?? undefined), option.id))
    else if (key === 'ArrowLeft') onBack()
    else if (key === 'Enter' || key === 'ArrowRight') onNext()
  })
  // A race in mind the setup still allows (the race chips drop any other).
  const raceQ = questions.find((x): x is RaceQ => x.type === 'race')
  const raceId = raceQ && values[raceQ.id]
  const race: RaceInMind | undefined =
    raceQ && typeof raceId === 'string' && (!common.setup || racesFor(common.setup).includes(raceId))
      ? { id: raceId, label: raceQ.options.find((o) => o.id === raceId)?.label[w] ?? raceId }
      : undefined
  if (!first) return null
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl leading-snug sm:text-3xl">{first.text[w]}</h1>
        {first.hint && <p className="mt-1 text-ash-300">{first.hint[w]}</p>}
      </div>
      <DirectAnswer q={first} {...answer(first)} race={race} />
      {rest.map((q) => (
        <section key={q.id} aria-labelledby={`q-${q.id}`} className="flex flex-col gap-2.5">
          <div>
            <h2 id={`q-${q.id}`} className="text-lg leading-snug sm:text-xl">
              {q.text[w]}
            </h2>
            {q.hint && <p className="text-sm text-ash-400">{q.hint[w]}</p>}
          </div>
          <DirectAnswer q={q} {...answer(q)} race={race} />
        </section>
      ))}
      {isLast && common.setup && <BuildsLeft answers={{ setup: common.setup, picks: values }} />}
      <Footer onBack={onBack} onNext={onNext} nextLabel={isLast ? en.quiz.seeResults : en.quiz.next} stacked={isLast} />
    </div>
  )
}

/** The last screen's live count of builds still in the running, and a warning when the answers leave none. */
function BuildsLeft({ answers }: { answers: Answers }) {
  const left = buildsLeft(answers)
  return (
    <p className={`text-sm ${left > 0 ? 'text-ash-300' : 'text-ember-400'}`} aria-live="polite">
      {left > 0 ? en.quiz.buildsLeft(left, gameData.builds.length) : en.quiz.noBuildsLeft}
    </p>
  )
}

/** The answer area of a question that can share a screen: tick boxes, race chips or class chips. */
function DirectAnswer({ q, race, ...common }: Common & { q: Question; race?: RaceInMind }) {
  if (q.type === 'multi') return <TickGrid q={q} {...common} />
  if (q.type === 'race') return <RaceChips q={q} {...common} />
  if (q.type === 'skipClasses') return <ClassChips q={q} {...common} race={race} />
  return null
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

function BackButton({ onBack, className = '' }: { onBack: () => void; className?: string }) {
  return (
    <button type="button" className={`btn-ghost ${className}`} onClick={onBack}>
      ← {en.quiz.back}
    </button>
  )
}

/** Back and next. `stacked`: the long reveal button gets the full width on phones instead of wrapping. */
function Footer({ onBack, onNext, nextLabel, stacked = false }: { onBack: () => void; onNext: () => void; nextLabel: string; stacked?: boolean }) {
  return (
    <div className={`mt-2 flex gap-3 ${stacked ? 'flex-col-reverse sm:flex-row sm:items-center sm:justify-between' : 'items-center justify-between'}`}>
      <BackButton onBack={onBack} className={stacked ? 'self-start sm:self-auto' : ''} />
      <button type="button" className="btn-primary" onClick={onNext}>
        {nextLabel}
      </button>
    </div>
  )
}

/** Scenario and pick-one questions: tap an option and we move on. */
function ChoiceList({ q, wording: w, hardcore, value, onChange, onNext, onBack, onPreview }: Common & { q: SingleQ }) {
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
          <button key={o.id} type="button" className="choice pr-11" aria-pressed={value === o.id} onClick={() => pick(o.id)} {...previewOn(onPreview, () => o.id)}>
            <span className="kbd">{i + 1}</span>
            <span>{(hardcore && o.hardcoreLabel ? o.hardcoreLabel : o.label)[w]}</span>
            <PickMark className="absolute top-1/2 right-3.5 -translate-y-1/2" />
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
function ThisOrThat({ q, wording: w, value, onChange, onNext, onBack, onPreview }: Common & { q: SingleQ }) {
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
            {...previewOn(onPreview, () => o.id)}
          >
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[inherit] border-2 border-gold-400"
              style={{ opacity: i === 0 ? leftGlow : rightGlow }}
            />
            <span className="flex w-full items-center">
              <span className="kbd">{i + 1}</span>
              <PickMark className="ml-auto" />
            </span>
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

/**
 * A scale ("Waiting for something good is…") as steps on a line, each one a big tap target (a native range's thumb was
 * small and hid how many steps there are). The middle step is picked until you choose another, and Next keeps it.
 */
function SliderAnswer({ q, wording: w, value, onChange, onNext, onBack, isLast, onPreview }: Common & { q: SliderQ }) {
  const answered = q.options.findIndex((o) => o.id === value)
  const [index, setIndex] = useState(answered >= 0 ? answered : Math.floor((q.options.length - 1) / 2))
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
      <div className="panel flex flex-col gap-3 p-5">
        <div role="radiogroup" aria-label={q.text[w]} className="relative flex items-center justify-between">
          {/* The line the steps sit on, from the middle of the first step to the middle of the last. */}
          <span aria-hidden="true" className="absolute inset-x-5.5 top-1/2 h-px -translate-y-1/2 bg-night-600" />
          {q.options.map((o, i) => (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={i === index}
              aria-label={o.label[w]}
              className="step"
              onClick={() => commit(i)}
              {...previewOn(onPreview, () => o.id)}
            >
              <span className="step-dot" />
            </button>
          ))}
        </div>
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

function Priorities({ q, wording: w, value, onChange, onNext, onBack, isLast, onPreview }: Common & { q: PrioritiesQ }) {
  const picked = asList(value)
  // Taps on another answer once the picks are full. Each one shakes the hint, which then says what to do.
  const [blocked, setBlocked] = useState(0)
  const toggled = (id: string) =>
    picked.includes(id) ? picked.filter((x) => x !== id) : picked.length < q.pick ? [...picked, id] : picked
  const toggle = (id: string) => {
    if (picked.length >= q.pick && !picked.includes(id)) return setBlocked((n) => n + 1)
    setBlocked(0)
    onChange(toggled(id))
  }
  useHotkeys((key) => {
    const option = q.options[digitIndex(key)]
    if (option) toggle(option.id)
    else if (key === 'ArrowLeft') onBack()
    else if (key === 'Enter' || key === 'ArrowRight') onNext()
  })
  return (
    <>
      <p className={`text-sm transition-colors ${blocked ? 'text-gold-300' : 'text-ash-400'}`} aria-live="polite">
        <span key={blocked} className={blocked ? 'nudge' : undefined}>
          {blocked ? en.quiz.prioritiesFull(q.pick) : en.quiz.prioritiesHint(q.pick - picked.length)}
        </span>
      </p>
      {/* The rank sits in a tag on the tile's top edge, away from the number-key badge (and with no reflow). */}
      <div className="grid gap-x-2 gap-y-3 sm:grid-cols-2">
        {q.options.map((o, i) => {
          const rank = picked.indexOf(o.id)
          return (
            <button key={o.id} type="button" className="choice" aria-pressed={rank >= 0} onClick={() => toggle(o.id)} {...previewOn(onPreview, () => toggled(o.id))}>
              <span className="kbd">{i + 1}</span>
              <span>{o.label[w]}</span>
              {rank >= 0 && (
                <span className="absolute -top-2 right-3 rounded-full bg-gold-400 px-2 py-px font-display text-[11px] leading-tight font-semibold tracking-wider text-night-950">
                  {en.quiz.rank(rank + 1)}
                </span>
              )}
            </button>
          )
        })}
      </div>
      <Footer onBack={onBack} onNext={onNext} nextLabel={isLast ? en.quiz.seeResults : en.quiz.next} />
    </>
  )
}

/** The ticked options after toggling one; ticking an option unticks the one it can't go with. */
function toggledTick(q: MultiQ, picked: string[], id: string): string[] {
  if (picked.includes(id)) return picked.filter((x) => x !== id)
  const clashes = q.exclusive.flatMap(([a, b]) => (a === id ? [b] : b === id ? [a] : []))
  return [...picked.filter((x) => !clashes.includes(x)), id]
}

function MultiAnswer({ q, value, onChange, onNext, onBack, isLast, ...common }: Common & { q: MultiQ }) {
  const picked = asList(value)
  useHotkeys((key) => {
    const option = q.options[digitIndex(key)]
    if (option) onChange(toggledTick(q, picked, option.id))
    else if (key === 'ArrowLeft') onBack()
    else if (key === 'Enter' || key === 'ArrowRight') onNext()
  })
  return (
    <>
      <TickGrid q={q} value={value} onChange={onChange} onNext={onNext} onBack={onBack} isLast={isLast} {...common} />
      <Footer onBack={onBack} onNext={onNext} nextLabel={isLast ? en.quiz.seeResults : picked.length === 0 ? en.quiz.none : en.quiz.next} stacked={isLast} />
    </>
  )
}

/** Tick boxes, two per row. Options are ordered in either-or pairs, so each row is one choice. */
function TickGrid({ q, wording: w, value, onChange, onPreview }: Common & { q: MultiQ }) {
  const picked = asList(value)
  return (
    <div className="grid grid-cols-2 gap-2">
      {q.options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="checkbox"
          aria-checked={picked.includes(o.id)}
          className="choice gap-2.5 px-3 py-2.5 text-[15px] leading-snug sm:px-4 sm:text-base"
          onClick={() => onChange(toggledTick(q, picked, o.id))}
          {...previewOn(onPreview, () => toggledTick(q, picked, o.id))}
        >
          <span className="checkbox" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </span>
          <span>{o.label[w]}</span>
        </button>
      ))}
    </div>
  )
}

/** A picked race's check: a small badge on the chip's top-right corner, so the row of chips doesn't reflow. */
const CHIP_MARK = 'absolute -top-1.5 -right-1.5 size-4'

/** "Got a race in mind?": "Surprise me" (the racials decide) or one race the player's faction and pack allow. */
function RaceChips({ q, wording: w, value, onChange, setup = ANY_SETUP }: Common & { q: RaceQ }) {
  const allowed = racesFor(setup)
  const picked = typeof value === 'string' && allowed.includes(value) ? value : undefined
  // A race picked before the faction or pack changed may no longer be possible: drop it.
  useEffect(() => {
    if (value != null && !picked) onChange(undefined)
  }, [value, picked, onChange])
  const needsPack = (id: string) => setup.skyborne === 'unsure' && !!gameData.races.find((r) => r.id === id)?.requiresPurchase
  return (
    <div role="radiogroup" aria-label={q.text[w]} className="flex flex-wrap gap-2">
      <button type="button" role="radio" aria-checked={!picked} className="chip" onClick={() => onChange(undefined)}>
        {en.quiz.surpriseMe}
        <PickMark className={CHIP_MARK} />
      </button>
      {q.options
        .filter((o) => allowed.includes(o.id))
        .map((o) => (
          <button key={o.id} type="button" role="radio" aria-checked={picked === o.id} className="chip" onClick={() => onChange(o.id)}>
            {o.label[w]}
            {needsPack(o.id) && <span className="text-xs text-ash-400">· {en.quiz.needsPack}</span>}
            <PickMark className={CHIP_MARK} />
          </button>
        ))}
    </div>
  )
}

/**
 * Classes to skip: tap to strike one out, tap again to bring it back. Our own class glyphs (no game icons in the quiz).
 * With a race in mind, the classes it can't be are greyed out, since they're out already; they can still be tapped.
 */
function ClassChips({ q, wording: w, value, onChange, race }: Common & { q: SkipClassesQ; race?: RaceInMind }) {
  const skipped = asList(value)
  const playable = race && classesFor(race.id)
  const isOut = (id: string) => !!playable && !playable.includes(id as ClassId)
  const noteId = `q-${q.id}-race`
  return (
    <>
      <div role="group" aria-label={q.text[w]} className="flex flex-wrap gap-2">
        {q.options.map((o) => (
          <button
            key={o.id}
            type="button"
            role="checkbox"
            aria-checked={skipped.includes(o.id)}
            aria-describedby={isOut(o.id) ? noteId : undefined}
            className={isOut(o.id) ? 'chip chip-out' : 'chip'}
            onClick={() => onChange(skipped.includes(o.id) ? skipped.filter((x) => x !== o.id) : [...skipped, o.id])}
          >
            <ClassGlyph classId={o.id as ClassId} className="size-4 shrink-0" />
            {o.label[w]}
          </button>
        ))}
      </div>
      {race && q.options.some((o) => isOut(o.id)) && (
        <p id={noteId} className="text-sm text-ash-400">
          {en.quiz.raceRulesOut(race.label)}
        </p>
      )}
    </>
  )
}
