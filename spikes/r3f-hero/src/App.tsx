import { lazy, Suspense, useMemo, useState } from 'react'

// The whole 3D stack (three, R3F, drei, postprocessing) lives behind this dynamic import.
const HeroScene = lazy(() => import('./scene/HeroScene'))

// Modern RAID_CLASS_COLORS values (unverified for the Forever client — see docs/RESEARCH.md §9).
const CLASS_COLORS: Record<string, string> = {
  Paladin: '#F48CBA', Mage: '#3FC7EB', Druid: '#FF7C0A', Warlock: '#8788EE', Priest: '#FFFFFF',
  Warrior: '#C69B6D', Hunter: '#AAD372', Rogue: '#FFF468', Shaman: '#0070DD',
}

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

// 2D fallback: the same idea (silhouette + class glow + fog) in SVG/CSS, no WebGL needed.
function Fallback2D({ color, progress }: { color: string; progress: number }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
      background: 'radial-gradient(ellipse at 50% 70%, #18203a 0%, #05070d 60%)' }}>
      <svg viewBox="0 0 120 220" width="200" aria-label="Hero silhouette"
        style={{ filter: `drop-shadow(0 0 ${4 + progress * 14}px ${color})`, opacity: 0.4 + progress * 0.6 }}>
        <ellipse cx="60" cy="205" rx="48" ry="9" fill="#141a2b" />
        <path fill="#07090f" stroke={color} strokeWidth="1.2"
          d="M60 20a14 14 0 1 1 0 28a14 14 0 1 1 0-28zM38 54h44l8 60-12 4-4 80H66l-6-62-6 62H46l-4-80-12-4z" />
      </svg>
    </div>
  )
}

export default function App() {
  const params = new URLSearchParams(location.search)
  const webgl = useMemo(() => hasWebGL() && !params.has('no3d'), [])
  const reducedMotion = useMemo(() => matchMedia('(prefers-reduced-motion: reduce)').matches, [])
  const [progress, setProgress] = useState(0.35)
  const [cls, setCls] = useState('Paladin')
  const [sd, setSd] = useState(false)
  const color = CLASS_COLORS[cls]

  return (
    <div className="app">
      <div className="stage">
        {webgl ? (
          <Suspense fallback={<Fallback2D color={color} progress={progress} />}>
            <HeroScene progress={progress} color={color} sd={sd} reducedMotion={reducedMotion} />
          </Suspense>
        ) : (
          <Fallback2D color={color} progress={progress} />
        )}
      </div>
      <div className="hud">
        <strong>Spike B — forming hero (R3F){webgl ? '' : ' · 2D fallback'}</strong>
        <label className="row">
          Forming {Math.round(progress * 100)}%
          <input type="range" min={0} max={1} step={0.01} value={progress}
            onChange={(e) => setProgress(Number(e.target.value))} />
        </label>
        <div className="row">
          {Object.keys(CLASS_COLORS).map((c) => (
            <button key={c} aria-pressed={c === cls} onClick={() => setCls(c)}
              style={{ color: CLASS_COLORS[c] }}>{c}</button>
          ))}
        </div>
        <div className="row">
          <button aria-pressed={sd} onClick={() => setSd((v) => !v)}>{sd ? 'SD (2004)' : 'HD'} — toggle</button>
          <code id="fps">– fps</code>
          <code id="stats" />
          <code id="ready" />
        </div>
      </div>
    </div>
  )
}
