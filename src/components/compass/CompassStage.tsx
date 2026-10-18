import { useReducedMotion } from 'motion/react'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import type { CompassSceneProps } from '../../three/CompassScene'
import { can3d, isLowPower, WebGLFallback } from '../webgl'
import { CompassMap2D } from './CompassMap2D'

// The whole 3D stack (three, R3F, drei, postprocessing) lives behind this dynamic import.
const CompassScene = lazy(() => import('../../three/CompassScene'))

/** Feathers the 3D scene's edges into the page so it has no hard box around it. */
const EDGE_FADE = 'radial-gradient(ellipse 50% 50% at 50% 50%, #000 70%, transparent 100%)'
const EDGE_FADE_STYLE = { maskImage: EDGE_FADE, WebkitMaskImage: EDGE_FADE }

/** Below this height the axis labels would crowd the compass, so they're hidden. */
const LABELS_MIN_HEIGHT = 220

type SceneInput = Omit<CompassSceneProps, 'labels' | 'labelElements' | 'interactive' | 'reducedMotion' | 'lowPower' | 'active' | 'onReady'>

/** The compass: 3D where the device allows, the flat map everywhere else (and while 3D loads). */
export function CompassStage({ className = '', ...scene }: SceneInput & { className?: string }) {
  const reducedMotion = useReducedMotion() ?? false
  const [want3d] = useState(can3d)
  const [mounted, setMounted] = useState(false)
  const [ready, setReady] = useState(false)
  const [active, setActive] = useState(true)
  const [height, setHeight] = useState(0)
  const [interactive] = useState(() => typeof window !== 'undefined' && window.matchMedia?.('(pointer: fine)').matches === true)
  const box = useRef<HTMLDivElement>(null)
  /** The six axis labels, laid over the 3D canvas; the scene moves them to the axis tips every frame. */
  const labelEls = useRef<(HTMLSpanElement | null)[]>([])

  // Let the flat map and the page paint first; fetch the 3D chunk when the browser is idle.
  useEffect(() => {
    if (!want3d) return
    const start = () => setMounted(true)
    const idle = window.requestIdleCallback?.(start, { timeout: 1500 }) ?? window.setTimeout(start, 300)
    return () => (window.cancelIdleCallback ? window.cancelIdleCallback(idle) : window.clearTimeout(idle))
  }, [want3d])

  // Track size (for the labels) and visibility (no rendering while scrolled out of view).
  useEffect(() => {
    const el = box.current
    if (!el) return
    setHeight(el.clientHeight)
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => setHeight(el.clientHeight))
    ro?.observe(el)
    const io = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([e]) => setActive(e?.isIntersecting ?? true))
    io?.observe(el)
    return () => {
      ro?.disconnect()
      io?.disconnect()
    }
  }, [])

  const labels = height >= LABELS_MIN_HEIGHT
  const flat = (
    <div className="absolute inset-0">
      <CompassMap2D {...scene} labels={labels} />
    </div>
  )

  return (
    <div ref={box} className={`relative ${className}`}>
      {(!mounted || !ready) && flat}
      {mounted && (
        <WebGLFallback fallback={flat}>
          <Suspense fallback={null}>
            <div className={`absolute inset-0 transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}>
              {/* The edge fade masks a box around the canvas, never the <canvas> itself: some browsers stop
                  drawing a masked WebGL canvas. The labels sit outside the box, so they stay crisp. */}
              <div className="absolute inset-0" style={EDGE_FADE_STYLE}>
                <CompassScene
                  {...scene}
                  labels={labels}
                  labelElements={labelEls}
                  interactive={interactive}
                  reducedMotion={reducedMotion}
                  lowPower={isLowPower()}
                  active={active}
                  onReady={() => setReady(true)}
                />
              </div>
              {labels && (
                <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                  {scene.axisEnds.flatMap((ends, axis) =>
                    ends.map((text, i) => (
                      <span
                        key={`${axis}-${i}`}
                        ref={(el) => void (labelEls.current[axis * 2 + i] = el)}
                        className="absolute top-0 left-0 font-display text-[10px] tracking-[0.18em] whitespace-nowrap text-gold-300 uppercase will-change-transform"
                        style={{ opacity: 0, textShadow: '0 0 6px #04060c, 0 0 2px #04060c' }}
                      >
                        {text}
                      </span>
                    )),
                  )}
                </div>
              )}
            </div>
          </Suspense>
        </WebGLFallback>
      )}
    </div>
  )
}
