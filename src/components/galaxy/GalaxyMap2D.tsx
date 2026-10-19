import { useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { ClassId } from '../../data'
import { classConstellations } from '../../galaxy/constellations'
import { declutter, type Disc } from '../../galaxy/declutter'
import type { Vec3 } from '../../galaxy/pca'
import { en } from '../../i18n/en'
import type { GalaxyStar } from '../../three/GalaxyScene'
import { SpecIcon } from '../icons/GameIcons'

type Props = {
  stars: GalaxyStar[]
  you: { pos: Vec3; label: string; links: string[] } | null
  selected: string | null
  /** The builds that play most like the selected one. */
  neighbors: string[]
  /** Highlight one class's constellation, dim the rest. */
  focusClass: ClassId | null
  /** Plain words for both ends of the three directions: [negative end, positive end]. */
  axisEnds: [string, string][]
  onSelect: (id: string) => void
  /** Stars burst out from the middle on first show (off while it stands in for the loading 3D view). */
  intro?: boolean
}

// Flat Spec Galaxy: the first two directions as left/right and down/up, the third as icon size.
// Works without WebGL, and every star is a real button for keyboard and screen-reader users.
// Drawn in the box's own CSS pixels (measured), so icons and text stay crisp at any shape.

const GOLD = '#e6c27a'
const YOU = '#f5c86b'
const FALLBACK = { w: 720, h: 520 }
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/** A fixed scatter of faint background stars (percent positions), the same on every visit. */
const SKY = (() => {
  let seed = 7
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  return Array.from({ length: 70 }, () => ({ x: rand() * 100, y: rand() * 100, r: 0.4 + rand() * 0.9, o: 0.25 + rand() * 0.5, t: rand() }))
})()

/** Where things go in a box of w × h CSS pixels: the middle is the average build; one unit reaches the padded edge. */
function layoutFor(w: number, h: number) {
  const pad = { x: clamp(w * 0.08, 30, 70), y: clamp(h * 0.09, 40, 56) }
  const cx = w / 2
  const cy = h / 2
  const rx = cx - pad.x
  const ry = cy - pad.y
  const base = clamp(Math.min(w, h) / 17, 20, 30)
  return {
    w,
    h,
    cx,
    cy,
    rx,
    ry,
    X: (p: Vec3) => cx + clamp(p[0], -1.08, 1.08) * rx,
    Y: (p: Vec3) => cy - clamp(p[1], -1.08, 1.08) * ry,
    /** Bigger icon = further toward the third direction's positive end. */
    iconSize: (p: Vec3) => Math.round(base * (0.8 + (clamp(p[2], -1, 1) + 1) * 0.2)),
  }
}

/** The box's size in CSS pixels: measured before the first paint, then on every resize. */
function useBoxSize(ref: React.RefObject<HTMLElement | null>) {
  const [size, setSize] = useState(FALLBACK)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const update = (w: number, h: number) => {
      if (w > 0 && h > 0) setSize((s) => (s.w === w && s.h === h ? s : { w, h }))
    }
    update(el.clientWidth, el.clientHeight)
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(([entry]) => entry && update(entry.contentRect.width, entry.contentRect.height))
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref])
  return size
}

export function GalaxyMap2D({ stars, you, selected, neighbors, focusClass, axisEnds, onSelect, intro = true }: Props) {
  const box = useRef<HTMLDivElement>(null)
  const { w, h } = useBoxSize(box)
  const glow = `galaxy-glow-${useId().replace(/[^\w-]/g, '')}`
  const [hovered, setHovered] = useState<string | null>(null)

  const layout = useMemo(() => layoutFor(w, h), [w, h])
  const { cx, cy, rx, ry, X, Y, iconSize } = layout
  // Icons are nudged apart where they would overlap; your star stays put and the others make room for it.
  const placed = useMemo(() => {
    const discs: Disc[] = stars.map((s) => ({ x: layout.X(s.pos), y: layout.Y(s.pos), r: layout.iconSize(s.pos) * 0.56 }))
    if (you) discs.push({ x: layout.X(you.pos), y: layout.Y(you.pos), r: 10, fixed: true })
    return declutter(discs, { w: layout.w, h: layout.h }).slice(0, stars.length)
  }, [stars, you, layout])

  const byId = new Map(stars.map((s) => [s.id, s]))
  const indexOf = new Map(stars.map((s, i) => [s.id, i]))
  const spot = (id: string) => placed[indexOf.get(id) ?? -1] ?? { x: cx, y: cy }
  const constellations = useMemo(() => classConstellations(stars), [stars])
  // Intro order: the stars nearest the middle come out first.
  const order = useMemo(() => {
    const rankOf = new Map(
      [...stars].sort((a, b) => Math.hypot(a.pos[0], a.pos[1]) - Math.hypot(b.pos[0], b.pos[1])).map((s, i) => [s.id, i]),
    )
    return (id: string) => rankOf.get(id) ?? 0
  }, [stars])
  const selectedStar = selected ? byId.get(selected) : undefined
  const selectedClass = selectedStar?.classId ?? null
  const shown = (hovered && byId.get(hovered)) || selectedStar
  /** Props that fade an element in `delay` seconds into the intro (merged with its own class and style). */
  const fadeIn = (delay: number, className = '', style: React.CSSProperties = {}) => ({
    className: [className, intro && 'galaxy-fade-in'].filter(Boolean).join(' ') || undefined,
    style: intro ? { ...style, animationDelay: `${delay}s` } : style,
  })

  const axisEnd = (axis: 0 | 1, sign: 1 | -1) => (axis === 0 ? { x: cx + sign * (cx - 12), y: cy } : { x: cx, y: cy - sign * (cy - 26) })

  const youAt = you ? { x: X(you.pos), y: Y(you.pos) } : null
  /** The name tag goes under its star, or over it when under would cover the "You" tag (≈52 × 24 px, 14 px above your star). */
  const namePlace = ((): React.CSSProperties => {
    if (!shown) return {}
    const { x, y } = spot(shown.id)
    const gap = iconSize(shown.pos) * 0.62 + 6
    const half = (shown.name.length * 6.4 + 20) / 2
    const coversYou = (top: number) => youAt != null && Math.abs(youAt.x - x) < half + 26 && top < youAt.y - 14 && top + 24 > youAt.y - 38
    return coversYou(y + gap) && !coversYou(y - gap - 24)
      ? { left: x, top: y - gap, translate: '-50% -100%' }
      : { left: x, top: y + gap, translate: '-50% 0' }
  })()

  return (
    <div
      ref={box}
      role="group"
      aria-label={en.galaxy.mapLabel}
      className="relative h-full w-full overflow-hidden select-none"
      style={{
        background:
          'radial-gradient(ellipse 55% 45% at 30% 32%, rgb(106 90 208 / 0.16), transparent 70%), radial-gradient(ellipse 50% 50% at 74% 70%, rgb(59 79 154 / 0.2), transparent 70%), radial-gradient(ellipse at center, #141c33 0%, #04060c 75%)',
      }}
    >
      <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <filter id={glow} x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="2.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* The sky */}
        {SKY.map((s, i) => (
          <circle
            key={i}
            cx={`${s.x}%`}
            cy={`${s.y}%`}
            r={s.r}
            fill="#dfe6ff"
            opacity={s.o}
            className={s.t < 0.45 ? 'galaxy-twinkle' : undefined}
            style={s.t < 0.45 ? { animationDelay: `${s.t * 9}s`, animationDuration: `${2.6 + s.t * 4}s` } : undefined}
          />
        ))}

        {/* The chart: two orbits, the axes drawn out from the middle, ticks and glowing caps */}
        <g {...fadeIn(0)}>
          <ellipse cx={cx} cy={cy} rx={rx * 0.5} ry={ry * 0.5} fill="none" stroke={GOLD} strokeOpacity="0.12" />
          <ellipse
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
            fill="none"
            stroke={GOLD}
            strokeOpacity="0.22"
            strokeDasharray="1.5 7.5"
            className="galaxy-flow"
            style={{ animationDuration: '2.4s' }}
          />
        </g>
        {([0, 1] as const).flatMap((axis) =>
          ([-1, 1] as const).map((sign) => {
            const end = axisEnd(axis, sign)
            return (
              <g key={`${axis}${sign}`}>
                <line
                  x1={cx}
                  y1={cy}
                  x2={end.x}
                  y2={end.y}
                  pathLength={1}
                  stroke={GOLD}
                  strokeOpacity="0.55"
                  strokeWidth="1"
                  className={intro ? 'galaxy-draw' : undefined}
                />
                {[0.5, 1].map((t) => {
                  const p: Vec3 = axis === 0 ? [sign * t, 0, 0] : [0, sign * t, 0]
                  const [dx, dy] = axis === 0 ? [0, 4] : [4, 0]
                  return (
                    <line key={t} x1={X(p) - dx} y1={Y(p) - dy} x2={X(p) + dx} y2={Y(p) + dy} stroke={GOLD} strokeOpacity="0.45" {...fadeIn(0.5)} />
                  )
                })}
                <circle cx={end.x} cy={end.y} r="2.2" fill={GOLD} filter={`url(#${glow})`} {...fadeIn(0.6)} />
              </g>
            )
          }),
        )}
        <circle cx={cx} cy={cy} r="2" fill={GOLD} fillOpacity="0.7" />

        {/* Constellations, then the lines to your top 3 and to the selected star's nearest builds */}
        <g {...fadeIn(1.1)}>
          {constellations.map(({ classId, lines }) => {
            const hot = classId === focusClass || (!focusClass && classId === selectedClass)
            const color = stars.find((s) => s.classId === classId)!.color
            return lines.map(([a, b]) => (
              <line
                key={`${a}-${b}`}
                x1={placed[a]!.x}
                y1={placed[a]!.y}
                x2={placed[b]!.x}
                y2={placed[b]!.y}
                stroke={color}
                strokeWidth={hot ? 1.6 : 1}
                strokeOpacity={hot ? 0.85 : focusClass ? 0.06 : 0.28}
                style={{ transition: 'stroke-opacity 300ms, stroke-width 300ms' }}
              />
            ))
          })}
          {selectedStar &&
            neighbors.map((id) => {
              const n = byId.get(id)
              return n ? (
                <line
                  key={`n-${id}`}
                  x1={spot(selectedStar.id).x}
                  y1={spot(selectedStar.id).y}
                  x2={spot(n.id).x}
                  y2={spot(n.id).y}
                  stroke="#ffffff"
                  strokeOpacity="0.45"
                  strokeDasharray="5 4"
                  className="galaxy-flow"
                />
              ) : null
            })}
          {you &&
            you.links.map((id) => {
              const t = byId.get(id)
              return t ? (
                <line
                  key={`y-${id}`}
                  x1={X(you.pos)}
                  y1={Y(you.pos)}
                  x2={spot(t.id).x}
                  y2={spot(t.id).y}
                  stroke={YOU}
                  strokeOpacity="0.7"
                  strokeWidth="1.5"
                  strokeDasharray="5 4"
                  className="galaxy-flow"
                />
              ) : null
            })}
        </g>

        {/* Your star */}
        {you && (
          <g {...fadeIn(1.2)}>
            <circle cx={X(you.pos)} cy={Y(you.pos)} r="9" fill="none" stroke={YOU} strokeWidth="1.2" className="galaxy-ping" />
            <path
              d={`M${X(you.pos)} ${Y(you.pos) - 9}l2.6 6.4l6.4 2.6l-6.4 2.6l-2.6 6.4l-2.6-6.4l-6.4-2.6l6.4-2.6z`}
              fill={YOU}
              filter={`url(#${glow})`}
            />
          </g>
        )}
      </svg>

      {/* Axis words at the ends: left/right under the line, down/up beyond the ends */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 font-display text-[9px] tracking-[0.18em] whitespace-nowrap text-gold-300 uppercase sm:text-[10px]">
        {[
          { text: axisEnds[0]?.[0], style: { left: 10, top: cy + 7 } },
          { text: axisEnds[0]?.[1], style: { right: 10, top: cy + 7 } },
          { text: axisEnds[1]?.[1], style: { left: cx, top: 6, translate: '-50% 0' } },
          { text: axisEnds[1]?.[0], style: { left: cx, bottom: 6, translate: '-50% 0' } },
        ].map(({ text, style }, i) => (
          <span key={i} {...fadeIn(0.5, 'absolute', { ...style, textShadow: '0 0 6px #04060c, 0 0 2px #04060c' })}>
            {text}
          </span>
        ))}
        {/* The third direction is icon size */}
        <span {...fadeIn(0.7, 'absolute right-3 bottom-2.5 flex flex-col items-start gap-1 text-gold-300/85')}>
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-[3px] border border-gold-300/70" />
            {axisEnds[2]?.[0]}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="-ml-[3px] inline-block size-4 rounded-[4px] border border-gold-300/70" />
            {axisEnds[2]?.[1]}
          </span>
        </span>
      </div>

      {/* The stars: spec icons in class-colored frames */}
      {stars.map((s) => {
        const size = iconSize(s.pos)
        const { x, y } = spot(s.id)
        const isSel = s.id === selected
        const isShown = s.id === shown?.id
        const lit = !s.dim && (!focusClass || s.classId === focusClass)
        return (
          <button
            key={s.id}
            type="button"
            aria-label={s.name}
            aria-pressed={isSel}
            onClick={() => onSelect(s.id)}
            onPointerEnter={() => setHovered(s.id)}
            onPointerLeave={() => setHovered((v) => (v === s.id ? null : v))}
            onFocus={() => setHovered(s.id)}
            onBlur={() => setHovered((v) => (v === s.id ? null : v))}
            className={`absolute rounded-md transition-[scale,opacity,box-shadow] duration-300 ${intro ? 'galaxy-burst' : ''}`}
            style={
              {
                left: x - size / 2,
                top: y - size / 2,
                width: size,
                height: size,
                color: s.color,
                opacity: lit ? 1 : s.dim ? 0.35 : 0.22,
                scale: isSel ? 1.25 : isShown ? 1.15 : 1,
                zIndex: Math.round((s.pos[2] + 1) * 10) + (isSel ? 40 : 0) + (isShown ? 60 : 0),
                boxShadow: isShown ? `0 0 0 2px ${GOLD}, 0 0 18px 2px ${s.color}` : `0 0 0 1.5px ${s.color}, 0 0 10px -2px ${s.color}`,
                '--from-x': `${cx - x}px`,
                '--from-y': `${cy - y}px`,
                animationDelay: `${0.2 + order(s.id) * 0.035}s`,
              } as React.CSSProperties
            }
          >
            {isSel && <span aria-hidden="true" className="galaxy-ping pointer-events-none absolute -inset-1.5 rounded-lg border border-gold-300/80" />}
            <SpecIcon build={s.build} className="block size-full" />
          </button>
        )
      })}

      {/* The name of the star you point at (or the selected one): always mounted, so it fades in once with the intro */}
      <span
        aria-hidden="true"
        {...fadeIn(1.5, 'pointer-events-none absolute top-0 left-0 z-[200] rounded-full bg-night-900/90 px-2.5 py-1 text-xs whitespace-nowrap', {
          ...namePlace,
          color: shown?.color,
          opacity: shown ? 1 : 0,
        })}
      >
        {shown?.name}
      </span>
      {you && youAt && (
        <span
          aria-hidden="true"
          {...fadeIn(
            1.2,
            'pointer-events-none absolute z-[150] rounded-full bg-night-900/85 px-2.5 py-1 font-display text-xs tracking-widest text-gold-300 uppercase',
            { left: youAt.x, top: youAt.y - 14, translate: '-50% -100%' },
          )}
        >
          {you.label}
        </span>
      )}
    </div>
  )
}
