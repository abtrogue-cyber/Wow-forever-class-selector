import { motion } from 'motion/react'
import { useEffect } from 'react'
import { useLocation } from 'wouter'
import meta from '../data/meta.json'
import { Hero2D } from '../components/hero/Hero2D'
import { Page } from '../components/layout/Site'
import { en } from '../i18n/en'
import { useQuizStore } from '../state/quizStore'

export function LandingPage() {
  const [, navigate] = useLocation()
  const step = useQuizStore((s) => s.step)
  const reset = useQuizStore((s) => s.reset)

  // Warm up the quiz (engine + data) while the visitor reads, so the CTA responds instantly.
  useEffect(() => {
    const load = () => void import('./QuizPage')
    const idle = window.requestIdleCallback?.(load) ?? window.setTimeout(load, 1500)
    return () => (window.cancelIdleCallback ? window.cancelIdleCallback(idle) : window.clearTimeout(idle))
  }, [])

  const start = () => {
    reset()
    navigate('/quiz')
  }

  return (
    <Page>
      <section className="grid items-center gap-6 pt-6 pb-4 md:grid-cols-[1fr_1.1fr] md:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="order-1 md:order-2"
        >
          <Hero2D progress={0.18} color="#f5c86b" className="mx-auto h-56 w-auto sm:h-72 md:h-[440px]" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
          className="order-2 flex flex-col gap-5 md:order-1"
        >
          <p className="font-display text-xs tracking-[0.25em] text-gold-400 uppercase">{en.landing.eyebrow}</p>
          <h1 className="text-4xl leading-tight sm:text-5xl">{en.tagline}</h1>
          <p className="text-lg text-ash-300">{en.landing.lead}</p>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="btn-primary" onClick={start}>
              {en.landing.cta}
            </button>
            {step > 0 && (
              <button type="button" className="btn-ghost" onClick={() => navigate('/quiz')}>
                {en.landing.resume}
              </button>
            )}
          </div>
          <ul className="flex flex-col gap-1.5 text-sm text-ash-300">
            {en.landing.facts.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="text-gold-400" aria-hidden="true">
                  ✦
                </span>
                {f}
              </li>
            ))}
          </ul>
          <p className="text-xs text-ash-400">{en.landing.beta(meta.lastVerified)}</p>
        </motion.div>
      </section>
    </Page>
  )
}
