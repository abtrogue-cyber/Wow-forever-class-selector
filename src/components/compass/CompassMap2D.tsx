import type { Vec3 } from '../../galaxy/pca'
import type { CompassStar } from './compass'

// The quiz compass, flat: the first two directions as x/y, the third as your star's size. Used without
// WebGL and while the 3D scene loads. Movement and the reveal are CSS transitions, so it needs no frame loop.

type Props = {
  position: Vec3
  preview: Vec3 | null
  stops: Vec3[]
  tint: string
  orb: string
  novelty: boolean
  companion: boolean
  pulse: string
  axisEnds: [string, string][]
  stars: CompassStar[]
  starMode: 'hidden' | 'faint' | 'full'
  revealTarget: string | null
  labels: boolean
}

const S = 42
const X = (p: Vec3) => p[0] * S
const Y = (p: Vec3) => -p[1] * S
const size = (p: Vec3) => 2.2 + (p[2] + 1) * 0.7
const GOLD = '#e6c27a'

export function CompassMap2D({ position, preview, stops, tint, orb, novelty, companion, pulse, axisEnds, stars, starMode, revealTarget, labels }: Props) {
  const target = revealTarget ? stars.find((s) => s.id === revealTarget) : undefined
  const here = target ? target.pos : position
  const orbColor = target ? target.color : orb
  const path = [...stops, position].map((p) => `${X(p)},${Y(p)}`).join(' ')
  const move = (p: Vec3, delay = 0) => ({
    transform: `translate(${X(p)}px, ${Y(p)}px)`,
    transition: `transform 900ms cubic-bezier(.45,0,.2,1) ${delay}ms`,
  })

  return (
    <svg
      viewBox="-60 -54 120 108"
      className="h-full w-full"
      // The sky fades out at the edges (no hard box), while the labels drawn on top stay crisp.
      style={{ background: `radial-gradient(ellipse 50% 50% at 50% 50%, ${tint}38 0%, #070a14 55%, rgba(4, 6, 12, 0) 100%)` }}
      aria-hidden="true"
    >
      <defs>
        <filter id="compass-glow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="1.6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* armillary */}
      <circle r={S} fill="none" stroke={GOLD} strokeOpacity="0.28" strokeWidth="0.35" />
      <ellipse rx={S} ry={S * 0.32} fill="none" stroke={GOLD} strokeOpacity="0.16" strokeWidth="0.3" />
      <ellipse rx={S * 0.32} ry={S} fill="none" stroke={GOLD} strokeOpacity="0.12" strokeWidth="0.3" />
      <line x1={-S * 1.18} x2={S * 1.18} stroke={GOLD} strokeOpacity="0.45" strokeWidth="0.35" />
      <line y1={-S * 1.18} y2={S * 1.18} stroke={GOLD} strokeOpacity="0.45" strokeWidth="0.35" />
      {[-1, -0.5, 0.5, 1].map((t) => (
        <g key={t} fill={GOLD} fillOpacity="0.6">
          <circle cx={t * S} r="0.6" />
          <circle cy={t * S} r="0.6" />
        </g>
      ))}
      {labels && (
        <g className="font-display" fontSize="3.4" letterSpacing="0.5" fill="#f0d898" style={{ textTransform: 'uppercase' }}>
          <text x={-S * 1.16} y="-2.4" textAnchor="start">{axisEnds[0]?.[0]}</text>
          <text x={S * 1.16} y="-2.4" textAnchor="end">{axisEnds[0]?.[1]}</text>
          <text y={S * 1.2 + 3.4} textAnchor="middle">{axisEnds[1]?.[0]}</text>
          <text y={-S * 1.2 - 1.6} textAnchor="middle">{axisEnds[1]?.[1]}</text>
        </g>
      )}

      {/* spec stars */}
      {stars.map((s) => {
        const shown = starMode === 'full' ? 1 : starMode === 'faint' ? 0.3 : 0
        const flare = s.id === revealTarget
        const d = Math.hypot(s.pos[0] - position[0], s.pos[1] - position[1])
        return (
          <circle
            key={s.id}
            cx={X(s.pos)}
            cy={Y(s.pos)}
            r={size(s.pos) * (flare ? 1.7 : 0.75)}
            fill={s.color}
            filter="url(#compass-glow)"
            style={{ opacity: shown, transition: `opacity 500ms ease ${starMode === 'full' ? 80 + d * 260 : 0}ms, r 400ms ease 1500ms` }}
          />
        )
      })}

      {/* constellation of your answers */}
      {stops.length > 0 && !target && (
        <polyline points={path} fill="none" stroke={GOLD} strokeOpacity="0.55" strokeWidth="0.45" strokeLinejoin="round" />
      )}
      {!target &&
        stops.map((p, i) => <circle key={i} cx={X(p)} cy={Y(p)} r="0.9" fill={GOLD} fillOpacity={0.35 + (0.5 * (i + 1)) / stops.length} />)}

      {/* where the hovered answer would take you */}
      {preview && !target && (
        <g>
          <line x1={X(position)} y1={Y(position)} x2={X(preview)} y2={Y(preview)} stroke={orb} strokeOpacity="0.6" strokeWidth="0.4" strokeDasharray="1.4 1" />
          <circle cx={X(preview)} cy={Y(preview)} r={size(preview) + 1.5} fill="none" stroke={orb} strokeOpacity="0.75" strokeWidth="0.45" />
        </g>
      )}

      {/* your star */}
      <g style={move(here, target ? 700 : 0)}>
        <circle r={size(here) * 2.6} fill={orbColor} fillOpacity="0.16" filter="url(#compass-glow)" />
        <circle r={size(here)} fill={orbColor} filter="url(#compass-glow)" />
        <circle r={size(here) * 0.45} fill="#fff" fillOpacity="0.85" />
        {novelty && (
          <ellipse rx={size(here) * 2} ry={size(here) * 0.7} fill="none" stroke={orbColor} strokeOpacity="0.8" strokeWidth="0.35" className="compass-spin" />
        )}
        {companion && (
          <g className="compass-orbit">
            <circle cx={size(here) * 2.8} r="0.9" fill="#d8ffb0" filter="url(#compass-glow)" />
          </g>
        )}
        <circle key={pulse} r={size(here)} fill="none" stroke={orbColor} strokeWidth="0.5" className="compass-pulse" />
      </g>
    </svg>
  )
}
