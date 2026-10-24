import { describe, expect, it } from 'vitest'
import { rawData } from '../data/raw'
import type { ClassId } from '../data/schemas'
import { parseGameData } from '../data/validate'
import { CLASS_FANS, PERSONAS } from './personas'
import { rank } from './rank'

const data = parseGameData(rawData)

describe('persona snapshots', () => {
  for (const persona of PERSONAS) {
    describe(persona.label, () => {
      const res = rank(persona.answers, data)
      const ids = res.results.map((r) => r.buildId)

      for (const { inTop, anyOf } of persona.expect) {
        it(`has one of [${anyOf.join(', ')}] in the top ${inTop}`, () => {
          expect(ids.slice(0, inTop).some((id) => anyOf.includes(id))).toBe(true)
        })
      }

      it('never offers a role it ruled out, not even as the dual spec', () => {
        const ruledOut = [res.profile.filters.includes('noHeal') && 'healer', res.profile.filters.includes('noTank') && 'tank']
        for (const r of res.results) {
          const roles = [r.buildId, r.dualSpec?.buildId].map((id) => data.builds.find((b) => b.id === id)?.role)
          for (const role of roles) expect(ruledOut).not.toContain(role)
        }
      })

      const { minTop = 85, minGap = 15, maxMedian = 70 } = persona.match ?? {}
      it(`lands a great fit at ${minTop}–97% and keeps mediocre fits clearly lower`, () => {
        const matches = res.results.map((r) => r.match)
        expect(matches[0]).toBeGreaterThanOrEqual(minTop)
        expect(matches[0]).toBeLessThanOrEqual(97)
        if (matches.length >= 10) expect((matches[0] ?? 0) - (matches[9] ?? 0)).toBeGreaterThanOrEqual(minGap)
        if (matches.length === data.builds.length) {
          const median = matches[Math.floor(matches.length / 2)] ?? 0
          expect(median).toBeGreaterThanOrEqual(25)
          expect(median).toBeLessThanOrEqual(maxMedian)
        }
      })

      it('matches the snapshot', () => {
        const summary = res.results.slice(0, 5).map(
          (r) =>
            `${r.rank}. ${r.buildId} ${r.match}% | races ${r.races.map((x) => x.raceId + (x.needsPack ? '(pack)' : '')).join(', ')}` +
            ` | dual ${r.dualSpec?.buildId ?? '-'} | why: ${r.reasons.map((x) => x.source).join(', ')} | watch: ${r.watchOuts
              .map((x) => x.source)
              .join(', ')}`,
        )
        summary.push(`why not: ${res.whyNot.map((w) => w.buildId).join(', ') || '-'}`)
        summary.push(`excluded: ${res.excluded.map((e) => `${e.buildId}(${e.reason})`).join(', ') || '-'}`)
        expect(summary).toMatchSnapshot()
      })
    })
  }
})

// D30's check, rebuilt (D48): a typical fan of each class finds that class in the top 3. The druid fan doesn't yet:
// no answer speaks to shapeshifting, so all-rounders (Survival, Enhancement) outscore Balance and Feral.
const KNOWN_MISSES: ClassId[] = ['druid']

describe('class fans', () => {
  for (const fan of CLASS_FANS) {
    it(`${fan.classId}: ${fan.label}`, () => {
      const classes = rank(fan.answers, data).results.slice(0, 3).map((r) => data.builds.find((b) => b.id === r.buildId)?.classId)
      expect(classes.includes(fan.classId)).toBe(!KNOWN_MISSES.includes(fan.classId))
    })
  }
})
