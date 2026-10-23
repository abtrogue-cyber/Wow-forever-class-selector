import { describe, expect, it } from 'vitest'
import { rawData } from '../data/raw'
import type { AxisId } from '../data/schemas'
import { parseGameData } from '../data/validate'
import { CONFIG } from './config'
import { getContext } from './context'
import { unwantedAxes } from './explain'
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
    const unwanted = [...unwantedAxes(res.profile)]
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
        expect(res.profile.skippedClasses).not.toContain(b.classId)
        // "No healing" / "no tanking": no such spec anywhere, not even as the dual spec.
        const partner = ctx.builds.get(r.dualSpec?.buildId ?? '')
        if (filters.has('noHeal')) expect([b.role, partner?.role]).not.toContain('healer')
        if (filters.has('noTank')) expect([b.role, partner?.role]).not.toContain('tank')
        // A race in mind: only classes it can be, and it leads the list.
        if (res.profile.race) {
          expect(r.races[0]).toMatchObject({ raceId: res.profile.race, chosen: true })
          expect(r.races.filter((x) => x.chosen)).toHaveLength(1)
        } else {
          expect(r.races.some((x) => x.chosen)).toBe(false)
        }

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

        // Explainable: the top 3 always get 3 reasons; lower ranks (the list shows only the first) get 1–3. Always a caveat.
        if (r.rank <= 3) expect(r.reasons).toHaveLength(3)
        expect(r.reasons.length).toBeGreaterThanOrEqual(1)
        expect(r.reasons.length).toBeLessThanOrEqual(3)
        expect(r.watchOuts.length).toBeGreaterThanOrEqual(1)

        // A strength never leans on an axis the player turned down or skipped, nor on one that counts against
        // the build for them (D46). Only the axis a reason is about may be its own.
        const against = r.components.filter((c) => c.rel < -CONFIG.explain.minRel).map((c) => c.id)
        for (const reason of r.reasons) {
          const strength = b.strengths.find((s) => s.text.newcomer === reason.text.newcomer)
          for (const axis of strength?.axes ?? []) {
            if (axis === reason.source) continue
            expect(unwanted, `${b.id}: ${reason.text.veteran}`).not.toContain(axis)
            expect(against, `${b.id}: ${reason.text.veteran}`).not.toContain(axis)
          }
        }

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

      // A race the faction or pack can't make is ignored rather than ruling everything out.
      const race = ctx.races.get(String(answers.picks.race ?? ''))
      const allowed = race && (faction === 'any' || race.factions.includes(faction)) && (!race.requiresPurchase || skyborne !== 'no')
      expect(res.profile.race).toBe(allowed ? race.id : null)

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
