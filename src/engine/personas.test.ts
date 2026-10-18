import { describe, expect, it } from 'vitest'
import { rawData } from '../data/raw'
import { parseGameData } from '../data/validate'
import { PERSONAS } from './personas'
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

      it('lands a great fit at 85–97% and keeps mediocre fits clearly lower', () => {
        const matches = res.results.map((r) => r.match)
        expect(matches[0]).toBeGreaterThanOrEqual(85)
        expect(matches[0]).toBeLessThanOrEqual(97)
        if (matches.length >= 10) expect((matches[0] ?? 0) - (matches[9] ?? 0)).toBeGreaterThanOrEqual(15)
        if (matches.length === data.builds.length) {
          const median = matches[Math.floor(matches.length / 2)] ?? 0
          expect(median).toBeGreaterThanOrEqual(25)
          expect(median).toBeLessThanOrEqual(70)
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
