// Nudges overlapping icons on the flat map apart, keeping each as close to its true place as it can.
// Pure and deterministic: the same input always gives the same layout.

export type Disc = { x: number; y: number; r: number; /** Never moves; others make room for it. */ fixed?: boolean }
export type DeclutterOptions = { gap?: number; iterations?: number; /** How hard each disc is pulled home per step. */ pull?: number }

/** Golden-angle direction for discs that sit exactly on top of each other. */
const spreadDir = (i: number) => [Math.cos(i * 2.39996), Math.sin(i * 2.39996)] as const

export function declutter(discs: Disc[], box: { w: number; h: number }, { gap = 3, iterations = 80, pull = 0.05 }: DeclutterOptions = {}) {
  const pos = discs.map((d) => ({ x: d.x, y: d.y }))
  for (let step = 0; step < iterations; step++) {
    discs.forEach((d, i) => {
      if (d.fixed) return
      pos[i]!.x += (d.x - pos[i]!.x) * pull
      pos[i]!.y += (d.y - pos[i]!.y) * pull
    })
    for (let i = 0; i < discs.length; i++) {
      for (let j = i + 1; j < discs.length; j++) {
        const a = discs[i]!
        const b = discs[j]!
        if (a.fixed && b.fixed) continue
        const pa = pos[i]!
        const pb = pos[j]!
        const d = Math.hypot(pb.x - pa.x, pb.y - pa.y)
        const overlap = a.r + b.r + gap - d
        if (overlap <= 0) continue
        const [ux, uy] = d > 1e-6 ? [(pb.x - pa.x) / d, (pb.y - pa.y) / d] : spreadDir(j)
        const shareA = a.fixed ? 0 : b.fixed ? 1 : 0.5
        pa.x -= ux * overlap * shareA
        pa.y -= uy * overlap * shareA
        pb.x += ux * overlap * (1 - shareA)
        pb.y += uy * overlap * (1 - shareA)
      }
    }
    discs.forEach((d, i) => {
      if (d.fixed) return
      pos[i]!.x = Math.min(box.w - d.r, Math.max(d.r, pos[i]!.x))
      pos[i]!.y = Math.min(box.h - d.r, Math.max(d.r, pos[i]!.y))
    })
  }
  return pos
}
