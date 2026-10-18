import type { GalaxyStar } from '../../three/GalaxyScene'
import type { Vec3 } from '../../galaxy/pca'

type Props = {
  stars: GalaxyStar[]
  you: { pos: Vec3; label: string; links: string[] } | null
  selected: string | null
  onSelect: (id: string) => void
}

// Flat Spec Galaxy: the first two directions as x/y, depth shown as size. Works without WebGL,
// and every star is a focusable button for keyboard and screen-reader users.
const X = (p: Vec3) => p[0] * 46
const Y = (p: Vec3) => -p[1] * 40
const size = (p: Vec3) => 2.6 + (p[2] + 1) * 0.9

export function GalaxyMap2D({ stars, you, selected, onSelect }: Props) {
  const byId = new Map(stars.map((s) => [s.id, s]))
  const label = selected ? byId.get(selected) : undefined
  return (
    <svg
      viewBox="-54 -48 108 96"
      className="h-full w-full"
      style={{ background: 'radial-gradient(ellipse at center, #141c33 0%, #04060c 70%)' }}
      role="group"
      aria-label="Spec Galaxy map"
    >
      <defs>
        <filter id="galaxy-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="1.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {you &&
        you.links.map((id) => {
          const t = byId.get(id)
          return t ? (
            <line key={id} x1={X(you.pos)} y1={Y(you.pos)} x2={X(t.pos)} y2={Y(t.pos)} stroke="#f5c86b" strokeOpacity="0.5" strokeWidth="0.35" strokeDasharray="1.2 0.8" />
          ) : null
        })}
      {stars.map((s) => {
        const active = s.id === selected
        return (
          <g
            key={s.id}
            role="button"
            tabIndex={0}
            aria-label={s.name}
            aria-pressed={active}
            className="cursor-pointer outline-none [&:focus-visible>circle:last-child]:stroke-parchment-100"
            onClick={() => onSelect(s.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelect(s.id)
              }
            }}
          >
            <circle cx={X(s.pos)} cy={Y(s.pos)} r={size(s.pos) + 2.5} fill="transparent" />
            <circle
              cx={X(s.pos)}
              cy={Y(s.pos)}
              r={size(s.pos) * (active ? 1.5 : 1) * 0.6}
              fill={s.color}
              fillOpacity={s.dim ? 0.25 : 1}
              filter="url(#galaxy-glow)"
              stroke={active ? '#fff' : 'transparent'}
              strokeWidth="0.4"
            />
          </g>
        )
      })}
      {you && (
        <g aria-hidden="true">
          <path
            d={`M${X(you.pos)} ${Y(you.pos) - 3}l1 2l2 1l-2 1l-1 2l-1-2l-2-1l2-1z`}
            fill="#f5c86b"
            filter="url(#galaxy-glow)"
          />
          <text x={X(you.pos)} y={Y(you.pos) - 4.5} textAnchor="middle" fontSize="3" fill="#f5c86b" className="font-display tracking-widest uppercase">
            {you.label}
          </text>
        </g>
      )}
      {label && (
        <text x={X(label.pos)} y={Y(label.pos) + size(label.pos) + 4} textAnchor="middle" fontSize="3" fill="#efe6d2" aria-hidden="true">
          {label.name}
        </text>
      )}
    </svg>
  )
}
