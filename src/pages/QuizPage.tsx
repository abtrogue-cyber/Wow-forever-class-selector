import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'wouter'
import { gameData } from '../data'
import { AXIS_ENDS, driftToward, lookFor, positionFor, STARS, trailFor } from '../components/compass/compass'
import { CompassStage } from '../components/compass/CompassStage'
import { QuestionGroup, QuestionScreen } from '../components/quiz/QuestionScreen'
import { quizScreens } from '../components/quiz/screens'
import { SetupScreen } from '../components/quiz/SetupScreen'
import { useQuizHistory } from '../components/quiz/useQuizHistory'
import { ENGINE_VERSION } from '../engine/config'
import { rank } from '../engine/rank'
import { en } from '../i18n/en'
import { encodeShareCode } from '../share/codec'
import { isSetupComplete, useQuizStore, wordingFor } from '../state/quizStore'

/** One screen per question, except the last, which asks the direct questions together. */
const SCREENS = quizScreens(gameData.questions.questions)
const TOTAL = SCREENS.length
const versions = { engineVersion: ENGINE_VERSION, dataVersion: gameData.meta.dataVersion }
/** Longest the reveal may take before the results open anyway (the scene normally says it's done sooner). */
const REVEAL_MAX_MS = 3400

type Value = string | string[] | undefined

export function QuizPage() {
  const [, navigate] = useLocation()
  const reducedMotion = useReducedMotion() ?? false
  const { setup, picks, step: storedStep, goTo, setPick } = useQuizStore()
  const complete = isSetupComplete(setup)
  const step = complete ? Math.min(storedStep, TOTAL) : 0
  const screen = step > 0 ? SCREENS[step - 1] : undefined
  const question = screen?.[0]
  const w = wordingFor(setup)
  const stepRef = useRef<HTMLDivElement>(null)

  // Your star: where your answers put you on the compass, and the stops it made on the way.
  const trail = useMemo(() => trailFor(setup, picks), [setup, picks])
  const position = trail[trail.length - 1]!
  const stops = useMemo(() => trail.slice(0, -1), [trail])
  const pulse = useMemo(() => JSON.stringify([setup, picks]), [setup, picks])

  // Which way the last answer moved your star, for the line under the compass (null: it didn't move it).
  // Setup changes move the star too, but only answers get a line.
  const [drift, setDrift] = useState<string | null>(null)
  const before = useRef({ position, picks })
  useEffect(() => {
    if (picks !== before.current.picks) setDrift(driftToward(before.current.position, position))
    before.current = { position, picks }
  }, [position, picks])

  // Hovering an answer previews where it would take you (and the sky or star color it would give).
  const [preview, setPreview] = useState<{ questionId: string; value: Value } | null>(null)
  useEffect(() => setPreview(null), [step])
  const previewPicks = useMemo(() => (preview ? { ...picks, [preview.questionId]: preview.value } : null), [preview, picks])
  const previewPos = useMemo(() => {
    if (!previewPicks) return null
    const p = positionFor(setup, previewPicks)
    return Math.hypot(p[0] - position[0], p[1] - position[1], p[2] - position[2]) > 0.01 ? p : null
  }, [previewPicks, setup, position])
  const look = lookFor(previewPicks ?? picks)

  // The reveal: the spec stars appear, your star flies to your #1, then the results open.
  const [reveal, setReveal] = useState<{ code: string; target: string } | null>(null)
  const opened = useRef(false)
  const openResults = (code: string) => {
    if (opened.current) return
    opened.current = true
    navigate(`/result/${code}`)
  }
  useEffect(() => {
    if (!reveal) return
    const go = () => openResults(reveal.code)
    const timer = window.setTimeout(go, REVEAL_MAX_MS)
    window.addEventListener('keydown', go)
    window.addEventListener('pointerdown', go)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('keydown', go)
      window.removeEventListener('pointerdown', go)
    }
  }, [reveal])

  useEffect(() => {
    window.scrollTo({ top: 0 })
    stepRef.current?.focus({ preventScroll: true })
  }, [step])

  const finish = () => {
    if (reveal) return
    const s = useQuizStore.getState()
    if (!isSetupComplete(s.setup)) return
    const answers = { setup: s.setup, picks: s.picks }
    const code = encodeShareCode(answers, versions)
    const target = rank(answers, gameData).results[0]?.buildId
    if (!target || reducedMotion) return openResults(code)
    // On phones the reveal button sits below the fold; bring the compass back into view for the show.
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setReveal({ code, target })
  }
  // Every screen has its own browser-history entry, so the browser's Back button and ours go the same way.
  const { forward, back: backOne } = useQuizHistory(step, goTo)
  const next = () => (step >= TOTAL ? finish() : forward(step + 1))
  const back = () => (step === 0 ? navigate('/') : backOne())

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="mx-auto grid w-full max-w-5xl flex-1 content-start gap-4 px-4 pt-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-10 lg:pt-0">
        {/* Phones: the compass sits above the questions. Desktop: questions left, compass right; at the reveal the
            compass glides to the middle of the page while the questions fade out. The rows keep their own height
            (content-start), so a short question isn't pushed down on a phone; desktop has no top padding, since the
            compass column is exactly one screen tall. */}
        <aside
          className={`flex flex-col items-center gap-3 transition-transform duration-700 ease-out lg:sticky lg:top-0 lg:order-2 lg:h-dvh lg:justify-center ${reveal ? 'lg:-translate-x-[70%] lg:scale-[1.15]' : ''}`}
        >
          <CompassStage
            position={position}
            preview={reveal ? null : previewPos}
            stops={stops}
            tint={look.tint}
            orb={look.orb}
            novelty={look.novelty}
            companion={look.companion}
            pulse={pulse}
            axisEnds={AXIS_ENDS}
            stars={STARS}
            starMode={reveal ? 'full' : 'hidden'}
            revealTarget={reveal?.target ?? null}
            onRevealDone={() => reveal && openResults(reveal.code)}
            wander={false}
            className={`w-full transition-[height] duration-700 ${reveal ? 'h-[60vh] lg:h-[540px]' : 'h-44 sm:h-52 lg:h-[460px]'}`}
          />
          <p className="text-center text-xs text-ash-400" aria-live="polite">
            {reveal ? (
              en.compass.skip
            ) : step > 0 && drift ? (
              <>
                {en.compass.drift} <span className="font-display tracking-[0.18em] text-gold-300 uppercase">{drift}</span>
              </>
            ) : step <= 1 ? (
              en.compass.hint
            ) : (
              ' '
            )}
          </p>
        </aside>

        {/* Desktop: every question starts at the same height (not centered), so the progress line and the title
            stay put from one question to the next. The offset lets a 6-answer question fit a 720 px tall window. */}
        <section
          className={`flex flex-col gap-4 pb-6 transition-opacity duration-500 lg:order-1 lg:pt-[max(2rem,calc(50dvh_-_18rem))] ${reveal ? 'pointer-events-none opacity-0' : ''}`}
          aria-hidden={reveal ? true : undefined}
        >
          <div className="flex items-center justify-between text-sm text-ash-400">
            <span>{step > 0 ? en.quiz.progress(step, TOTAL) : ''}</span>
            <Link href="/" className="hover:text-parchment-100">
              {en.quiz.exit}
            </Link>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              ref={stepRef}
              tabIndex={-1}
              className="outline-none"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {screen && question && screen.length > 1 ? (
                <QuestionGroup
                  key={question.id}
                  questions={screen}
                  wording={w}
                  hardcore={setup.ruleset === 'hardcore'}
                  setup={complete ? setup : undefined}
                  values={picks}
                  onChange={setPick}
                  onNext={next}
                  onBack={back}
                  onPreview={setPreview}
                  isLast={step === TOTAL}
                />
              ) : question ? (
                <QuestionScreen
                  key={question.id}
                  question={question}
                  wording={w}
                  hardcore={setup.ruleset === 'hardcore'}
                  setup={complete ? setup : undefined}
                  value={picks[question.id] ?? undefined}
                  onChange={(v) => setPick(question.id, v)}
                  onNext={next}
                  onBack={back}
                  onPreview={(p) => setPreview(p && { questionId: question.id, value: p.value })}
                  isLast={step === TOTAL}
                />
              ) : (
                <SetupScreen onBegin={() => forward(1)} />
              )}
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </div>
  )
}
