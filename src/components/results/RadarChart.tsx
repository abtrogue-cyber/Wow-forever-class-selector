// Small custom SVG radar: the player's targets vs. a build's scores (0–5).
type Point = { label: string; you: number; build: number }

type Props = { points: Point[]; color: string; title: string; youLabel: string; buildLabel: string; className?: string }

const SIZE = 260
const C = SIZE / 2
const R = 80

/** Point on spoke i at a 0–5 value. Labels sit beyond the scale, so they skip the clamp. */
const at = (i: number, n: number, value: number, clamp = true) => {
  const angle = -Math.PI / 2 + (2 * Math.PI * i) / n
  const r = (R * (clamp ? Math.max(0, Math.min(5, value)) : value)) / 5
  return [C + r * Math.cos(angle), C + r * Math.sin(angle)] as const
}
const polygon = (values: number[]) => values.map((v, i) => at(i, values.length, v).join(',')).join(' ')

export function RadarChart({ points, color, title, youLabel, buildLabel, className = '' }: Props) {
  const n = points.length
  const description = points.map((p) => `${p.label}: ${youLabel} ${p.you.toFixed(1)}, ${buildLabel} ${p.build}`).join('; ')
  return (
    <figure className={className}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={`${title}. ${description}`} className="w-full">
        {[1, 2, 3, 4, 5].map((ring) => (
          <polygon key={ring} points={polygon(points.map(() => ring))} fill="none" stroke="#2a3656" strokeWidth={ring === 5 ? 1.2 : 0.7} />
        ))}
        {points.map((_, i) => {
          const [x, y] = at(i, n, 5)
          return <line key={i} x1={C} y1={C} x2={x} y2={y} stroke="#2a3656" strokeWidth={0.7} />
        })}
        <polygon points={polygon(points.map((p) => p.build))} fill={color} fillOpacity={0.22} stroke={color} strokeWidth={1.8} />
        <polygon points={polygon(points.map((p) => p.you))} fill="none" stroke="#f5d38b" strokeWidth={1.8} strokeDasharray="4 3" />
        {points.map((p, i) => {
          const [x, y] = at(i, n, 6.4, false)
          return (
            <text key={p.label} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill="#b8bfd0" fontSize="11">
              {p.label}
            </text>
          )
        })}
      </svg>
      <figcaption className="mt-1 flex justify-center gap-4 text-xs text-ash-400">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0 w-4 border-t-2 border-dashed border-gold-300" /> {youLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-4 rounded-sm" style={{ background: color, opacity: 0.6 }} /> {buildLabel}
        </span>
      </figcaption>
    </figure>
  )
}
