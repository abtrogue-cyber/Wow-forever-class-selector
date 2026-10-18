import { AXIS_IDS, type AxisId, type Build } from '../data'
import type { PlayerProfile } from '../engine/types'

// Spec Galaxy layout: principal component analysis of the builds' 14 axis scores.
// 28 × 14 numbers take well under a millisecond, so we compute it when the galaxy loads instead of
// shipping a generated file that could drift from builds.json. Deterministic: same data → same map.

export type Vec3 = [number, number, number]

export type Galaxy = {
  /** Star position per build, roughly within ±1 on each axis. */
  stars: Map<string, Vec3>
  /** The three directions, each as loadings per axis (unit length). */
  components: Record<AxisId, number>[]
  /** Share of the total variance each direction explains. */
  explained: number[]
  /** Place any axis vector (e.g. a player's targets) in the same space. */
  project: (values: Record<AxisId, number>) => Vec3
  /** The k builds most alike in the full 14-axis space (standardized), nearest first. */
  neighbors: (buildId: string, k: number) => string[]
}

const dot = (a: number[], b: number[]) => a.reduce((s, x, i) => s + x * (b[i] ?? 0), 0)
const norm = (a: number[]) => Math.sqrt(dot(a, a))

/** Top-k eigenvectors of a symmetric matrix by power iteration with deflation. */
function topEigen(m: number[][], k: number): { vectors: number[][]; values: number[] } {
  const n = m.length
  const work = m.map((row) => [...row])
  const vectors: number[][] = []
  const values: number[] = []
  for (let c = 0; c < k; c++) {
    // Deterministic, non-degenerate start vector.
    let v = Array.from({ length: n }, (_, i) => 1 + ((i * 7 + c * 3) % 5) / 10)
    let lambda = 0
    for (let iter = 0; iter < 2000; iter++) {
      const next = work.map((row) => dot(row, v))
      // Keep it exactly orthogonal to the directions already found (deflation alone drifts slightly).
      for (const u of vectors) {
        const d = dot(next, u)
        for (let i = 0; i < n; i++) next[i]! -= d * u[i]!
      }
      const len = norm(next)
      if (len === 0) break
      const nv = next.map((x) => x / len)
      const delta = norm(nv.map((x, i) => x - (v[i] ?? 0)))
      v = nv
      lambda = len
      if (delta < 1e-12) break
    }
    // Stable sign: the largest loading is positive.
    const big = v.reduce((best, x, i) => (Math.abs(x) > Math.abs(v[best] ?? 0) ? i : best), 0)
    if ((v[big] ?? 0) < 0) v = v.map((x) => -x)
    vectors.push(v)
    values.push(lambda)
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) work[i]![j]! -= lambda * v[i]! * v[j]!
  }
  return { vectors, values }
}

export function buildGalaxy(builds: Build[]): Galaxy {
  const n = builds.length
  const mean = AXIS_IDS.map((a) => builds.reduce((s, b) => s + b.axes[a], 0) / n)
  const std = AXIS_IDS.map((a, i) => Math.sqrt(builds.reduce((s, b) => s + (b.axes[a] - mean[i]!) ** 2, 0) / n) || 1)
  const z = (values: Record<AxisId, number>) => AXIS_IDS.map((a, i) => (values[a] - mean[i]!) / std[i]!)
  const rows = builds.map((b) => z(b.axes))

  const cov = AXIS_IDS.map((_, i) => AXIS_IDS.map((__, j) => rows.reduce((s, r) => s + r[i]! * r[j]!, 0) / n))
  const total = cov.reduce((s, row, i) => s + row[i]!, 0)
  const { vectors, values } = topEigen(cov, 3)

  const raw = (zv: number[]): Vec3 => [dot(zv, vectors[0]!), dot(zv, vectors[1]!), dot(zv, vectors[2]!)]
  const coords = rows.map(raw)
  // Scale each direction so the builds fill about ±1, keeping relative distances within a direction.
  const scale = [0, 1, 2].map((c) => Math.max(...coords.map((p) => Math.abs(p[c]!))) || 1)
  const fit = (p: Vec3): Vec3 => [p[0] / scale[0]!, p[1] / scale[1]!, p[2] / scale[2]!]

  const stars = new Map(builds.map((b, i) => [b.id, fit(coords[i]!)]))
  const index = new Map(builds.map((b, i) => [b.id, i]))
  return {
    stars,
    components: vectors.map((v) => Object.fromEntries(AXIS_IDS.map((a, i) => [a, v[i]!])) as Record<AxisId, number>),
    explained: values.map((v) => v / total),
    project: (values) => fit(raw(z(values))),
    neighbors: (buildId, k) => {
      const i = index.get(buildId)
      if (i == null) return []
      const me = rows[i]!
      return builds
        .map((b, j) => ({ id: b.id, d: j === i ? Infinity : norm(rows[j]!.map((x, t) => x - me[t]!)) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, k)
        .map((x) => x.id)
    },
  }
}

/** Where a player sits: their target on every axis they care about, the average build elsewhere. */
export function playerAxes(profile: PlayerProfile, builds: Build[]): Record<AxisId, number> {
  return Object.fromEntries(
    AXIS_IDS.map((a) => [a, profile.axes[a].weight > 0 ? profile.axes[a].target : builds.reduce((s, b) => s + b.axes[a], 0) / builds.length]),
  ) as Record<AxisId, number>
}

/** The axes that drive a direction most, strongest first (for the legend). */
export function topAxes(component: Record<AxisId, number>, k = 2): { axis: AxisId; sign: 1 | -1 }[] {
  return AXIS_IDS.map((axis) => ({ axis, w: component[axis] }))
    .sort((a, b) => Math.abs(b.w) - Math.abs(a.w))
    .slice(0, k)
    .map(({ axis, w }) => ({ axis, sign: w >= 0 ? 1 : -1 }))
}
