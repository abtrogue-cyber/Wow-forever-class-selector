import { describe, expect, it } from 'vitest'
import { rawData } from '../data/raw'
import type { AxisId } from '../data/schemas'
import { parseGameData } from '../data/validate'
import { CONFIG } from './config'
import { getContext } from './context'
import { rank } from './rank'
import { randomAnswers } from './testUtils'

const data = parseGameData(rawData)
const ctx = getContext(data)
const RUNS = 300

// Properties that must hold for every possible player (brief §12, definition of done).
describe(`engine invariants over ${RUNS} random players`, () => {
  for (let seed = 1; seed <= RUNS; seed++) {
    const answers = randomAnswers(seed, data)
    const res = rank(answers, data)
    const filters = new Set(res.profile.filters)
    const { faction, skyborne } = answers.setup

    it(`player #${seed}`, () => {
      // Deterministic: same answers, same result.
      expect(JSON.stringify(rank(answers, data))).toBe(JSON.stringify(res))
      expect(res.results.length + res.excluded.length).toBe(data.builds.length)

      res.results.forEach((r, i) => {
        const b = ctx.builds.get(r.buildId)!
        const cls = ctx.classes.get(b.classId)!
        expect(r.rank).toBe(i + 1)
        expect(r.match).toBeGreaterThanOrEqual(CONFIG.calibration.min)
        expect(r.match).toBeLessThanOrEqual(CONFIG.calibration.max)
        if (i > 0) expect(r.score).toBeLessThanOrEqual(res.results[i - 1]!.score + 1e-9)

        // Hard filters are always respected.
        if (filters.has('noPets')) expect(b.petStyle).not.toBe('required')
        if (filters.has('rangedOnly')) expect(b.axes.range).toBeGreaterThanOrEqual(3.5)
        if (filters.has('meleeOnly')) expect(b.axes.range).toBeLessThanOrEqual(1.5)
        if (filters.has('noStealth')) expect(b.stealth).toBeLessThan(2)
        if (filters.has('mustHeal')) expect(cls.roles).toContain('healer')
        if (filters.has('mustTank')) expect(cls.roles).toContain('tank')

        // Never an impossible race/class/faction combo; Skyborne only with the pack (or flagged as unsure).
        expect(r.races.length).toBeGreaterThanOrEqual(1)
        expect(r.races.length).toBeLessThanOrEqual(3)
        for (const race of r.races) {
          const meta = ctx.races.get(race.raceId)!
          expect(data.raceClass.combos.some((c) => c.raceId === race.raceId && c.classId === b.classId)).toBe(true)
          if (faction !== 'any') expect(meta.factions).toContain(faction)
          if (meta.requiresPurchase) {
            expect(skyborne).not.toBe('no')
            expect(race.needsPack).toBe(skyborne === 'unsure')
          }
        }

        // Explainable: 3 reasons and at least one caveat.
        expect(r.reasons).toHaveLength(3)
        expect(r.watchOuts.length).toBeGreaterThanOrEqual(1)

        // Axis reasons describe the build, not just the answer: no "heavy armor" on a leather wearer.
        const { low, high } = CONFIG.explain.fitBands
        for (const reason of r.reasons) {
          const axis = ctx.axes.get(reason.source as AxisId)
          if (axis?.mode !== 'closeness') continue
          if (reason.text === axis.texts.highFit) expect(b.axes[axis.id]).toBeGreaterThanOrEqual(high)
          if (reason.text === axis.texts.lowFit) expect(b.axes[axis.id]).toBeLessThanOrEqual(low)
          if (reason.text === axis.texts.midFit) expect(b.axes[axis.id]).toBeGreaterThan(low)
        }

        // Dual spec stays in the class and covers must-heal/must-tank.
        if (r.dualSpec) {
          const partner = ctx.builds.get(r.dualSpec.buildId)!
          expect(partner.classId).toBe(b.classId)
          expect(partner.id).not.toBe(b.id)
        }
        if (filters.has('mustHeal') && b.role !== 'healer' && !filters.has('mustTank')) {
          expect(ctx.builds.get(r.dualSpec?.buildId ?? '')?.role).toBe('healer')
        }
      })

      // "Why not" only lists popular builds outside the top 5.
      expect(res.whyNot.length).toBeLessThanOrEqual(CONFIG.explain.whyNotCount)
      const top5 = res.results.slice(0, 5).map((r) => r.buildId)
      for (const w of res.whyNot) {
        expect(ctx.builds.get(w.buildId)?.popular).toBe(true)
        expect(top5).not.toContain(w.buildId)
      }
    })
  }
})
