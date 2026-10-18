import { useEffect, useRef } from 'react'
import { PARTICLE_STYLE, type ParticlePreset } from './particles'

// The card reveal's particles: a burst from the card when it lands, then a gentle drift in the build's
// fantasy (gold motes, fel embers, frost shards…). Plain 2D canvas, so it needs no WebGL and no 3D chunk.

type Particle = { x: number; y: number; vx: number; vy: number; age: number; life: number; size: number }

type Props = {
  preset: ParticlePreset
  /** Milliseconds before the burst (lines up with the card flip). */
  delay?: number
  reducedMotion: boolean
}

export function ParticleBurst({ preset, delay = 1000, reducedMotion }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const el = canvas.current
    const ctx = el?.getContext('2d')
    if (!el || !ctx || reducedMotion) return
    const style = PARTICLE_STYLE[preset]
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    let w = 0
    let h = 0
    const resize = () => {
      w = el.clientWidth
      h = el.clientHeight
      el.width = Math.round(w * dpr)
      el.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const parts: Particle[] = []
    const burst = () => {
      const count = w < 640 ? 90 : 160
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2
        const speed = 2 + Math.random() * 6
        parts.push({ x: w / 2, y: h / 2, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, age: 0, life: 50 + Math.random() * 70, size: 2 + Math.random() * 3 })
      }
    }
    const drift = () => {
      // Ambient particles enter from the edge they would naturally come from.
      const x = w / 2 + (Math.random() - 0.5) * Math.min(w, 520)
      const y = style.dir > 0 ? h : style.dir < 0 ? 0 : h / 2 + (Math.random() - 0.5) * h * 0.6
      const vy = style.dir * -(0.4 + Math.random() * 0.8)
      parts.push({ x, y, vx: (Math.random() - 0.5) * 0.4, vy: style.dir === 0 ? (Math.random() - 0.5) * 0.4 : vy, age: 0, life: 160 + Math.random() * 160, size: 1.5 + Math.random() * 2.5 })
    }

    const draw = (p: Particle, alpha: number) => {
      ctx.globalAlpha = alpha
      ctx.beginPath()
      if (style.shape === 'shard') {
        const s = p.size * 1.6
        ctx.moveTo(p.x, p.y - s)
        ctx.lineTo(p.x + s * 0.55, p.y)
        ctx.lineTo(p.x, p.y + s)
        ctx.lineTo(p.x - s * 0.55, p.y)
        ctx.closePath()
      } else if (style.shape === 'ember') {
        ctx.ellipse(p.x, p.y, p.size * 0.5, p.size * 1.4, Math.atan2(p.vy, p.vx) + Math.PI / 2, 0, Math.PI * 2)
      } else {
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      }
      ctx.fill()
    }

    let frame = 0
    let raf = 0
    const start = performance.now()
    let burstDone = false
    const tick = (now: number) => {
      if (!burstDone && now - start >= delay) {
        burst()
        burstDone = true
      }
      if (burstDone && frame % 4 === 0 && parts.length < 220) drift()
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'
      ctx.fillStyle = style.color
      ctx.shadowColor = style.color
      ctx.shadowBlur = 8
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i]!
        p.age++
        p.vx *= 0.97
        p.vy = p.vy * 0.97 + style.dir * -0.03
        p.x += p.vx + Math.sin((p.age + i) * 0.05) * 0.2
        p.y += p.vy
        if (p.age >= p.life) {
          parts.splice(i, 1)
          continue
        }
        const t = p.age / p.life
        draw(p, Math.min(1, t * 6) * (1 - t))
      }
      frame++
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [preset, delay, reducedMotion])

  return <canvas ref={canvas} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
}
