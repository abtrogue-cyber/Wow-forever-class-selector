import { describe, expect, it } from 'vitest'
import { declutter, type Disc } from './declutter'

const box = { w: 400, h: 300 }
const overlapOf = (a: Disc, b: Disc, pa: { x: number; y: number }, pb: { x: number; y: number }) => a.r + b.r - Math.hypot(pa.x - pb.x, pa.y - pb.y)

describe('declutter', () => {
  it('leaves discs that already have room exactly where they are', () => {
    const discs: Disc[] = [
      { x: 50, y: 50, r: 10 },
      { x: 200, y: 150, r: 10 },
    ]
    expect(declutter(discs, box)).toEqual([
      { x: 50, y: 50 },
      { x: 200, y: 150 },
    ])
  })

  it('pulls a tight cluster apart (even discs on the very same spot) and keeps it near home', () => {
    const discs: Disc[] = Array.from({ length: 9 }, (_, i) => ({ x: 200 + (i % 3), y: 150 + Math.floor(i / 3), r: 12 }))
    discs.push({ x: 200, y: 150, r: 12 })
    const out = declutter(discs, box)
    for (let i = 0; i < discs.length; i++) {
      for (let j = i + 1; j < discs.length; j++) expect(overlapOf(discs[i]!, discs[j]!, out[i]!, out[j]!)).toBeLessThan(1.5)
      expect(Math.hypot(out[i]!.x - discs[i]!.x, out[i]!.y - discs[i]!.y)).toBeLessThan(60)
    }
  })

  it('never moves a fixed disc, and makes room around it', () => {
    const discs: Disc[] = [
      { x: 100, y: 100, r: 10, fixed: true },
      { x: 102, y: 100, r: 12 },
    ]
    const [you, star] = declutter(discs, box)
    expect(you).toEqual({ x: 100, y: 100 })
    expect(overlapOf(discs[0]!, discs[1]!, you!, star!)).toBeLessThanOrEqual(0)
  })

  it('keeps discs inside the box and is deterministic', () => {
    const discs: Disc[] = [
      { x: 2, y: 2, r: 10 },
      { x: 4, y: 3, r: 10 },
      { x: 399, y: 299, r: 10 },
    ]
    const out = declutter(discs, box)
    out.forEach((p, i) => {
      expect(p.x).toBeGreaterThanOrEqual(discs[i]!.r)
      expect(p.y).toBeGreaterThanOrEqual(discs[i]!.r)
      expect(p.x).toBeLessThanOrEqual(box.w - discs[i]!.r)
      expect(p.y).toBeLessThanOrEqual(box.h - discs[i]!.r)
    })
    expect(declutter(discs, box)).toEqual(out)
  })
})
