import { describe, expect, it } from 'vitest'
import { rawData } from '../data/raw'
import { parseGameData } from '../data/validate'
import { getContext } from './context'
import { exclusionReason } from './filters'
import { buildProfile } from './profile'
import { rank } from './rank'
import { rankRaces } from './races'
import { fitCurve, tagFit, toMatch } from './score'
import type { Answers, Setup } from './types'

const data = parseGameData(rawData)
const ctx = getContext(data)
const build = (id: string) => {
  const b = ctx.builds.get(id)
  if (!b) throw new Error(`no build ${id}`)
  return b
}
const setup = (over: Partial<Setup> = {}): Setup => ({ experience: 'played', faction: 'any', ruleset: 'normal', skyborne: 'no', ...over })
const answers = (picks: Answers['picks'] = {}, over: Partial<Setup> = {}): Answers => ({ setup: setup(over), picks })

describe('fit curve and calibration', () => {
  it('maps distance to fit', () => {
    expect(fitCurve(0)).toBe(1)
    expect(fitCurve(5)).toBe(0)
    expect(fitCurve(1)).toBeCloseTo(0.911, 3)
    expect(fitCurve(2)).toBeGreaterThan(fitCurve(3))
    expect(fitCurve(-1)).toBe(1)
  })

  it('is monotonic and clamped', () => {
    expect(toMatch(0)).toBe(5)
    expect(toMatch(1)).toBe(97)
    expect(toMatch(0.9)).toBeGreaterThan(toMatch(0.8))
    expect(toMatch(0.72)).toBe(50)
  })
})

describe('profile', () => {
  it('turns priorities into rank-weighted axis targets', () => {
    const p = buildProfile(answers({ priorities: ['raids', 'solo', 'gold'] }), ctx)
    expect(p.priorities).toEqual(['raid', 'soloLeveling', 'goldFarming'])
    expect(p.axes.raid).toEqual({ target: 5, weight: 3 * 0.7 })
    expect(p.axes.soloLeveling.weight).toBe(2)
    expect(p.axes.goldFarming.weight).toBe(1.2)
  })

  it('Hardcore raises survival and solo leveling', () => {
    const p = buildProfile(answers({ 'bad-pull': 'burn' }, { ruleset: 'hardcore' }), ctx)
    expect(p.axes.survivability.target).toBe(4)
    expect(p.axes.survivability.weight).toBeCloseTo(0.4 + 2)
    expect(p.axes.soloLeveling.target).toBe(4)
  })

  it('newcomers get low complexity unless they asked for complexity', () => {
    expect(buildProfile(answers({}, { experience: 'new' }), ctx).axes.complexity).toEqual({ target: 2, weight: 1 })
    const complex = buildProfile(answers({ 'simple-complex': 'complex' }, { experience: 'new' }), ctx)
    expect(complex.flags).toContain('wantsComplexity')
    expect(complex.axes.complexity.target).toBe(4.5)
  })

  it('clamps tag affinities and scales tag weight', () => {
    const p = buildProfile(answers({ gnolls: 'vanish', 'light-shadow': 'shadow', 'bad-pull': 'escape' }), ctx)
    expect(p.tags.trickster).toBe(3)
    expect(p.tagWeight).toBeGreaterThan(0)
    expect(buildProfile(answers(), ctx).tagWeight).toBe(0)
  })

  it('applies tweak multipliers', () => {
    const base = buildProfile(answers({ downtime: 'unbearable' }), ctx)
    const tweaked = buildProfile({ ...answers({ downtime: 'unbearable' }), tweaks: { sustain: 6 } }, ctx)
    expect(tweaked.axes.sustain.weight).toBe(base.axes.sustain.weight * 2)
  })
})

describe('scoring pieces', () => {
  it('tag fit is 0.5 without preferences and higher for matching fantasy', () => {
    const neutral = buildProfile(answers(), ctx)
    expect(tagFit(build('priest-shadow'), neutral)).toBe(0.5)
    const shadowFan = buildProfile(answers({ 'light-shadow': 'shadow' }), ctx)
    // cosine({shadow 2, fel 1, trickster 0.5, holy −1}, {shadow 3}) = 0.8 → fit 0.9
    expect(tagFit(build('priest-shadow'), shadowFan)).toBeCloseTo(0.9, 6)
    expect(tagFit(build('paladin-holy'), shadowFan)).toBeLessThan(0.5)
  })
})

describe('hard filters', () => {
  const profile = (filters: string[]) => buildProfile(answers({ 'deal-breakers': filters }), ctx)

  it('"no pets" drops pet-required builds but keeps optional-pet ones', () => {
    const p = profile(['no-pets'])
    expect(exclusionReason(build('hunter-beast-mastery'), p, ctx)).toBe('noPets')
    expect(exclusionReason(build('hunter-marksmanship'), p, ctx)).toBeNull()
    expect(exclusionReason(build('warlock-destruction'), p, ctx)).toBeNull()
  })

  it('"must heal/tank" is class-level (dual spec covers it)', () => {
    const heal = profile(['must-heal'])
    expect(exclusionReason(build('priest-shadow'), heal, ctx)).toBeNull()
    expect(exclusionReason(build('warrior-fury'), heal, ctx)).toBe('mustHeal')
    const tank = profile(['must-tank'])
    expect(exclusionReason(build('druid-balance'), tank, ctx)).toBeNull()
    expect(exclusionReason(build('shaman-enhancement'), tank, ctx)).toBe('mustTank')
  })

  it('range filters use the range axis', () => {
    expect(exclusionReason(build('hunter-survival'), profile(['ranged-only']), ctx)).toBe('rangedOnly')
    expect(exclusionReason(build('paladin-holy'), profile(['melee-only']), ctx)).toBe('meleeOnly')
  })

  it('"no stealth" drops rogues but not cat druids', () => {
    const p = profile(['no-stealth'])
    expect(exclusionReason(build('rogue-combat'), p, ctx)).toBe('noStealth')
    expect(exclusionReason(build('druid-feral-cat'), p, ctx)).toBeNull()
  })
})

describe('races', () => {
  const racesFor = (id: string, over: Partial<Setup>) => rankRaces(build(id), buildProfile(answers({}, over), ctx), ctx)

  it('Horde paladins are Undead only; Alliance shamans are Dwarves only', () => {
    expect(racesFor('paladin-holy', { faction: 'horde', skyborne: 'yes' }).map((r) => r.raceId)).toEqual(['undead'])
    expect(racesFor('shaman-elemental', { faction: 'alliance', skyborne: 'yes' }).map((r) => r.raceId)).toEqual(['dwarf'])
  })

  it('Skyborne needs the pack; "not sure" shows it with a badge and a penalty', () => {
    const ids = (over: Partial<Setup>) => racesFor('mage-frost', over).map((r) => r.raceId)
    expect(ids({ faction: 'alliance', skyborne: 'no' })).not.toContain('skyborne-high-order')
    expect(ids({ faction: 'alliance', skyborne: 'yes' })).toContain('skyborne-high-order')
    const yes = racesFor('mage-frost', { faction: 'alliance', skyborne: 'yes' }).find((r) => r.raceId === 'skyborne-high-order')
    const unsure = racesFor('mage-frost', { faction: 'alliance', skyborne: 'unsure' }).find((r) => r.raceId === 'skyborne-high-order')
    expect(yes?.needsPack).toBe(false)
    expect(unsure?.needsPack).toBe(true)
    expect((yes?.score ?? 0) - (unsure?.score ?? 0)).toBeCloseTo(1)
  })

  it('the look question moves races', () => {
    const elven = rankRaces(build('priest-holy'), buildProfile(answers({ look: 'elven' }), ctx), ctx)
    expect(elven[0]?.raceId).toBe('night-elf')
    const eerie = rankRaces(build('priest-holy'), buildProfile(answers({ look: 'eerie' }), ctx), ctx)
    expect(eerie[0]?.raceId).toBe('undead')
  })
})

describe('rank', () => {
  it('forces a healing dual spec when the main build cannot heal', () => {
    const res = rank(answers({ 'boss-pull': 'ranged', 'light-shadow': 'shadow', 'deal-breakers': ['must-heal'] }), data)
    for (const r of res.results) {
      const main = build(r.buildId)
      if (main.role !== 'healer') expect(build(r.dualSpec?.buildId ?? '').role).toBe('healer')
    }
  })

  it('keeps every build ranked when there are no answers', () => {
    const res = rank(answers(), data)
    expect(res.results).toHaveLength(28)
    expect(new Set(res.results.map((r) => r.match)).size).toBe(1)
  })

  it('reports when deal-breakers leave nothing', () => {
    const res = rank(answers({ 'deal-breakers': ['must-tank', 'ranged-only', 'no-stealth', 'must-heal'] }), data)
    // Druid survives: Balance is ranged, the class can heal and tank via dual spec.
    expect(res.results.map((r) => r.buildId)).toContain('druid-balance')
    const none = rank(answers({ 'deal-breakers': ['ranged-only', 'melee-only'] }), data)
    expect(none.results).toHaveLength(0)
    expect(none.notes).toEqual([data.explanations.notes.nothingLeft])
  })
})
