import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef } from 'react'
import { Link, useLocation } from 'wouter'
import { gameData } from '../data'
import { Hero2D } from '../components/hero/Hero2D'
import { SiteFooter } from '../components/layout/Site'
import { QuestionScreen } from '../components/quiz/QuestionScreen'
import { SetupScreen } from '../components/quiz/SetupScreen'
import { ENGINE_VERSION } from '../engine/config'
import { getContext } from '../engine/context'
import { rank } from '../engine/rank'
import { en } from '../i18n/en'
import { encodeShareCode } from '../share/codec'
import { isSetupComplete, useQuizStore, wordingFor } from '../state/quizStore'

const ctx = getContext(gameData)
const QUESTIONS = gameData.questions.questions
const TOTAL = QUESTIONS.length
const GOLD = '#f5c86b'

export function QuizPage() {
  const [, navigate] = useLocation()
  const { setup, picks, step: storedStep, goTo, setPick } = useQuizStore()
  const complete = isSetupComplete(setup)
  const step = complete ? Math.min(storedStep, TOTAL) : 0
  const question = step > 0 ? QUESTIONS[step - 1] : undefined
  const w = wordingFor(setup)
  const stepRef = useRef<HTMLDivElement>(null)

  // The hero glows in the color of the class currently leading, once there is something to go on.
  const leading = useMemo(() => {
    if (!complete || Object.keys(picks).length === 0) return null
    const result = rank({ setup, picks }, gameData)
    const top = result.results[0]
    const build = top && ctx.builds.get(top.buildId)
    const armor = result.profile.axes.armor
    return {
      color: build ? (ctx.classes.get(build.classId)?.colorHex ?? GOLD) : GOLD,
      armor: armor.weight > 0 ? armor.target / 5 : 0.5,
    }
  }, [complete, setup, picks])

  useEffect(() => {
    window.scrollTo({ top: 0 })
    stepRef.current?.focus({ preventScroll: true })
  }, [step])

  const finish = () => {
    const s = useQuizStore.getState()
    if (!isSetupComplete(s.setup)) return
    const code = encodeShareCode({ setup: s.setup, picks: s.picks }, { engineVersion: ENGINE_VERSION, dataVersion: gameData.meta.dataVersion })
    navigate(`/result/${code}`)
  }
  const next = () => (step >= TOTAL ? finish() : goTo(step + 1))
  const back = () => (step === 0 ? navigate('/') : goTo(step - 1))
  const progress = step / TOTAL

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="mx-auto grid w-full max-w-5xl flex-1 gap-4 px-4 pt-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10">
        <aside className="flex flex-col items-center gap-3 lg:sticky lg:top-0 lg:h-dvh lg:justify-center">
          <Hero2D
            progress={progress}
            color={leading?.color ?? GOLD}
            armor={leading?.armor}
            className="h-28 w-auto sm:h-40 lg:h-[440px]"
          />
          <div
            role="progressbar"
            aria-label={step > 0 ? en.quiz.progress(step, TOTAL) : en.quiz.setupTitle}
            aria-valuemin={0}
            aria-valuemax={TOTAL}
            aria-valuenow={step}
            className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-night-700"
          >
            <div className="h-full rounded-full bg-gold-400 transition-[width] duration-500" style={{ width: `${progress * 100}%` }} />
          </div>
        </aside>

        <section className="flex flex-col gap-4 pb-6 lg:justify-center lg:py-10">
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
              {question ? (
                <QuestionScreen
                  key={question.id}
                  question={question}
                  wording={w}
                  hardcore={setup.ruleset === 'hardcore'}
                  value={picks[question.id] ?? undefined}
                  onChange={(v) => setPick(question.id, v)}
                  onNext={next}
                  onBack={back}
                  isLast={step === TOTAL}
                />
              ) : (
                <SetupScreen onBegin={() => goTo(1)} />
              )}
            </motion.div>
          </AnimatePresence>
          <p className="hidden text-xs text-ash-400 lg:block">{en.quiz.keysHint}</p>
        </section>
      </div>
      <SiteFooter />
    </div>
  )
}
