import type { Vec3 } from './pca'

// Each class's specs drawn as a constellation: the shortest set of lines that joins them (a minimum
// spanning tree), so it reads like a stick figure rather than a closed shape. Shared by the 3D and flat maps.

const dist2 = (a: Vec3, b: Vec3) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2

/** The lines joining `points` (Prim's algorithm; ties keep input order). Index pairs into `points`. */
export function constellation(points: Vec3[]): [number, number][] {
  const inTree = points.length > 0 ? [0] : []
  const rest = points.map((_, i) => i).slice(1)
  const lines: [number, number][] = []
  while (rest.length > 0) {
    let best = { from: -1, at: -1, d: Infinity }
    for (const from of inTree) {
      rest.forEach((to, at) => {
        const d = dist2(points[from]!, points[to]!)
        if (d < best.d) best = { from, at, d }
      })
    }
    const [to] = rest.splice(best.at, 1)
    lines.push([best.from, to!])
    inTree.push(to!)
  }
  return lines
}

/** Every class's constellation, classes in first-seen order. Pairs are indices into `stars`. */
export function classConstellations<C extends string>(stars: { classId: C; pos: Vec3 }[]): { classId: C; lines: [number, number][] }[] {
  const byClass = new Map<C, number[]>()
  stars.forEach((s, i) => byClass.set(s.classId, [...(byClass.get(s.classId) ?? []), i]))
  return [...byClass].map(([classId, idx]) => ({
    classId,
    lines: constellation(idx.map((i) => stars[i]!.pos)).map(([a, b]) => [idx[a]!, idx[b]!] as [number, number]),
  }))
}
