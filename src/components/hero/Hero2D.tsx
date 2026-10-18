// The 2D forming hero: a silhouette in fog that gains armor, cape and weapon as the quiz progresses,
// glowing in the currently leading class color. (Phase 3 swaps in the 3D version where WebGL allows.)
type Props = {
  /** 0–1 quiz progress. */
  progress: number
  /** Leading class color (hex). */
  color: string
  /** 0 = robes … 1 = heavy plate: how bulky the armor pieces look. */
  armor?: number
  className?: string
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const stage = (p: number, from: number, to: number) => clamp01((p - from) / (to - from))

export function Hero2D({ progress, color, armor = 0.5, className = '' }: Props) {
  const body = 0.35 + 0.65 * stage(progress, 0, 0.3)
  const armorShow = stage(progress, 0.3, 0.55)
  const cape = stage(progress, 0.55, 0.75)
  const weapon = stage(progress, 0.75, 0.95)
  const glow = 4 + 18 * progress
  const pauldron = 9 + armor * 7

  return (
    <svg
      viewBox="0 0 200 260"
      className={className}
      aria-hidden="true"
      style={{ filter: `drop-shadow(0 0 ${glow}px ${color})`, transition: 'filter 600ms ease' }}
    >
      <defs>
        <radialGradient id="hero-fog" cx="50%" cy="85%" r="60%">
          <stop offset="0%" stopColor="#8f9bbd" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#8f9bbd" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* pedestal */}
      <ellipse cx="100" cy="236" rx="70" ry="12" fill="#1b2133" />
      <ellipse cx="100" cy="230" rx="56" ry="9" fill="#232a3e" />
      <ellipse cx="100" cy="229" rx="46" ry="6" fill="none" stroke={color} strokeOpacity={0.35 + 0.5 * progress} strokeWidth="1.5" style={{ transition: 'stroke 600ms ease' }} />

      <g stroke={color} strokeWidth="1.4" strokeOpacity={0.35 + 0.65 * progress} fill="#06080e" style={{ transition: 'stroke 600ms ease' }}>
        {/* cape */}
        <path d="M78 78 L122 78 L134 196 Q100 206 66 196 Z" opacity={cape} style={{ transition: 'opacity 500ms ease' }} />
        {/* body */}
        <g opacity={body} style={{ transition: 'opacity 500ms ease' }}>
          <path d="M88 150 L84 222 L96 222 L100 168 L104 222 L116 222 L112 150 Z" />
          <path d="M78 80 Q100 72 122 80 L116 152 L84 152 Z" />
          <path d="M78 82 L66 140 L74 142 L86 98 Z" />
          <path d="M122 82 L134 140 L126 142 L114 98 Z" />
          <circle cx="100" cy="58" r="15" />
        </g>
        {/* armor */}
        <g opacity={armorShow} style={{ transition: 'opacity 500ms ease' }}>
          <ellipse cx="76" cy="84" rx={pauldron} ry={pauldron * 0.65} />
          <ellipse cx="124" cy="84" rx={pauldron} ry={pauldron * 0.65} />
          <path d="M86 92 L114 92 L111 128 L89 128 Z" />
        </g>
        {/* weapon */}
        <g opacity={weapon} style={{ transition: 'opacity 500ms ease' }}>
          <path d="M138 70 L142 70 L141 150 L139 150 Z" />
          <path d="M131 150 L149 150 L149 154 L131 154 Z" />
          <path d="M138.5 154 L141.5 154 L141.5 166 L138.5 166 Z" />
        </g>
      </g>
      <rect x="0" y="150" width="200" height="110" fill="url(#hero-fog)" opacity={1 - 0.6 * progress} />
    </svg>
  )
}
