import { useReducedMotion } from 'motion/react'
import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { en } from '../../i18n/en'
import { Hero2D } from './Hero2D'
import { DEFAULT_LOOK, type HeroLook } from './look'

// The whole 3D stack (three, R3F, drei, postprocessing) lives behind this dynamic import.
const HeroScene = lazy(() => import('../../three/HeroScene'))

/** WebGL available, not opted out (?no3d), and the visitor isn't saving data. Checked once. */
let can3dCache: boolean | null = null
export function can3d(): boolean {
  if (can3dCache != null) return can3dCache
  try {
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true
    const optOut = new URLSearchParams(window.location.search).has('no3d')
    const c = document.createElement('canvas')
    can3dCache = !saveData && !optOut && !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    can3dCache = false
  }
  return can3dCache
}

/** Phones and weak machines start in low quality (DPR 1, fewer particles, no grain). */
function isLowPower(): boolean {
  const nav = navigator as Navigator & { deviceMemory?: number }
  return window.matchMedia('(max-width: 640px)').matches || (nav.deviceMemory ?? 8) <= 4 || (nav.hardwareConcurrency ?? 8) <= 4
}

/** Feathers the canvas edges into the page so the scene has no hard box around it. */
const EDGE_FADE = 'radial-gradient(ellipse 50% 50% at 50% 50%, #000 60%, transparent 100%)'

const SD_KEY = 'fm-hero-sd'
function readSd(): boolean {
  try {
    return window.localStorage.getItem(SD_KEY) === '1'
  } catch {
    return false
  }
}

/** If the 3D scene throws (lost context, driver bug), show the 2D hero instead of a broken page. */
class Fallback extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

type Props = {
  progress: number
  look?: HeroLook
  /** Size of the stage (the 3D canvas fills it). */
  className?: string
  /** Classes for the 2D silhouette inside the stage. */
  svgClassName?: string
}

/** The forming hero: 3D where the device allows, the 2D silhouette everywhere else (and while 3D loads). */
export function HeroStage({ progress, look = DEFAULT_LOOK, className = '', svgClassName = 'mx-auto h-full w-auto' }: Props) {
  const reducedMotion = useReducedMotion() ?? false
  const [want3d] = useState(can3d)
  const [mounted, setMounted] = useState(false)
  const [ready, setReady] = useState(false)
  const [active, setActive] = useState(true)
  const [sd, setSd] = useState(readSd)
  const box = useRef<HTMLDivElement>(null)

  // Let the 2D hero and the page paint first; fetch the 3D chunk when the browser is idle.
  useEffect(() => {
    if (!want3d) return
    const start = () => setMounted(true)
    const idle = window.requestIdleCallback?.(start, { timeout: 1500 }) ?? window.setTimeout(start, 300)
    return () => (window.cancelIdleCallback ? window.cancelIdleCallback(idle) : window.clearTimeout(idle))
  }, [want3d])

  // Don't burn battery rendering a hero that is scrolled out of view.
  useEffect(() => {
    const el = box.current
    if (!el || !mounted || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([entry]) => setActive(entry?.isIntersecting ?? true))
    io.observe(el)
    return () => io.disconnect()
  }, [mounted])

  const toggleSd = () => {
    setSd((v) => {
      try {
        window.localStorage.setItem(SD_KEY, v ? '0' : '1')
      } catch {
        // Storage blocked: the toggle still works for this visit.
      }
      return !v
    })
  }

  const flat = <Hero2D progress={progress} color={look.color} armor={look.armor} className={svgClassName} />

  return (
    <div ref={box} className={`relative ${className}`}>
      {(!mounted || !ready) && <div className="absolute inset-0">{flat}</div>}
      {mounted && (
        <Fallback fallback={<div className="absolute inset-0">{flat}</div>}>
          <Suspense fallback={null}>
            <div
              className={`absolute inset-0 transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}
              style={{ maskImage: EDGE_FADE, WebkitMaskImage: EDGE_FADE }}
            >
              <HeroScene
                progress={progress}
                look={look}
                sd={sd}
                reducedMotion={reducedMotion}
                lowPower={isLowPower()}
                active={active}
                onReady={() => setReady(true)}
              />
            </div>
          </Suspense>
        </Fallback>
      )}
      {mounted && ready && (
        <button
          type="button"
          onClick={toggleSd}
          aria-pressed={sd}
          title={sd ? en.hero.toHd : en.hero.toSd}
          className="absolute right-1 bottom-1 rounded-full border border-night-600 bg-night-900/80 px-2.5 py-1 font-display text-[11px] tracking-widest text-ash-300 hover:text-parchment-100"
        >
          {sd ? 'SD' : 'HD'}
          <span className="sr-only"> — {sd ? en.hero.toHd : en.hero.toSd}</span>
        </button>
      )}
    </div>
  )
}
