import { motion } from 'motion/react'
import { useEffect, useRef } from 'react'
import type { Wording } from '../../data'
import type { BuildResult } from '../../engine/types'
import { en } from '../../i18n/en'
import { ClassGlyph } from '../icons/Glyphs'
import { buildInfo, ctx } from './shared'

/** The #1 result flips over like a collectible card. Reduced motion: it simply fades in. */
export function RevealCard({ result, wording: w, onClose }: { result: BuildResult; wording: keyof Wording; onClose: () => void }) {
  const { build, cls } = buildInfo(result.buildId)
  const race = result.races[0]
  const button = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const t = window.setTimeout(() => button.current?.focus(), 900)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={en.result.title}
      className="fixed inset-0 z-40 flex items-center justify-center bg-night-950/90 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex flex-col items-center gap-6" style={{ perspective: 1200 }}>
        <p className="font-display text-sm tracking-[0.3em] text-gold-400 uppercase">{en.result.title}</p>
        <motion.div
          className="relative h-[420px] w-[290px]"
          style={{ transformStyle: 'preserve-3d' }}
          initial={{ rotateY: 180, scale: 0.85 }}
          animate={{ rotateY: 0, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.2, 0.8, 0.2, 1], delay: 0.25 }}
        >
          {/* back */}
          <div
            className="absolute inset-0 flex items-center justify-center rounded-3xl border-2 border-gold-500/70 bg-night-800"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <svg viewBox="0 0 64 64" className="size-28 text-gold-400" aria-hidden="true">
              <path d="M32 6 L52 19 V37 C52 48 43 55 32 59 C21 55 12 48 12 37 V19 Z" fill="none" stroke="currentColor" strokeWidth="2.5" />
              <path d="M32 19 L36.5 29.5 L47 30.5 L39 38 L41.5 49 L32 43 L22.5 49 L25 38 L17 30.5 L27.5 29.5 Z" fill="currentColor" />
            </svg>
          </div>
          {/* front */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-between rounded-3xl border-2 bg-gradient-to-b from-night-800 to-night-950 p-6 text-center"
            style={{ backfaceVisibility: 'hidden', borderColor: cls.colorHex, boxShadow: `0 0 80px -10px ${cls.colorHex}` }}
          >
            <span className="font-display text-xs tracking-[0.25em] text-ash-400 uppercase">{cls.name}</span>
            <ClassGlyph classId={cls.id} className="size-24" />
            <div>
              <h2 className="text-3xl leading-tight" style={{ color: cls.colorHex }}>
                {build.name}
              </h2>
              {race && (
                <p className="mt-1 text-parchment-100">
                  {ctx.races.get(race.raceId)?.name}
                  {race.newInForever && <span className="ml-1 text-gold-300">★</span>}
                </p>
              )}
            </div>
            <p className="font-display text-5xl font-semibold" style={{ color: cls.colorHex }}>
              {result.match}%
            </p>
            <p className="text-sm text-ash-300">{build.pitch[w]}</p>
          </div>
        </motion.div>
        <button ref={button} type="button" className="btn-primary" onClick={onClose}>
          {en.result.revealSee}
        </button>
      </div>
    </motion.div>
  )
}
