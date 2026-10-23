import { describe, expect, it } from 'vitest'
import { rawData } from '../data/raw'
import { AXIS_IDS } from '../data/schemas'
import { parseGameData } from '../data/validate'
import { ENGINE_VERSION } from '../engine/config'
import { PERSONAS } from '../engine/personas'
import { rank } from '../engine/rank'
import { randomAnswers } from '../engine/testUtils'
import type { Answers } from '../engine/types'
import { CODE_VERSION, ShareCodeError, decodeShareCode, encodeShareCode, isOutdated } from './codec'
import { LAYOUT_V2 } from './layout'

const data = parseGameData(rawData)
const versions = { engineVersion: 1, dataVersion: data.meta.dataVersion }
const current = { engineVersion: ENGINE_VERSION, dataVersion: data.meta.dataVersion }

/** The canonical form decode produces: skipped questions and neutral tweaks are simply absent. */
function canonical(a: Answers): Answers {
  const picks: Answers['picks'] = {}
  for (const q of LAYOUT_V2.questions) {
    const pick = a.picks[q.id]
    const list = pick == null ? [] : Array.isArray(pick) ? pick : [pick]
    if (list.length === 0) continue
    if (q.kind === 'single') picks[q.id] = list[0]
    else if (q.kind === 'ranked') picks[q.id] = list.slice(0, q.slots)
    else picks[q.id] = q.options.filter((o) => list.includes(o))
  }
  const out: Answers = { setup: a.setup, picks }
  const tweaks = Object.entries(a.tweaks ?? {}).filter(([, level]) => level != null && level !== 4)
  if (tweaks.length > 0) out.tweaks = Object.fromEntries(tweaks.sort(([x], [y]) => LAYOUT_V2.axes.indexOf(x) - LAYOUT_V2.axes.indexOf(y)))
  return out
}

describe('share codec', () => {
  it('the frozen v2 layout still matches questions.json (change the questions → add a new layout version)', () => {
    const now = {
      setup: Object.fromEntries(data.questions.setup.map((s) => [s.id, s.options.map((o) => o.id)])),
      questions: data.questions.questions.map((q) =>
        q.type === 'priorities'
          ? { id: q.id, kind: 'ranked', slots: q.pick, options: q.options.map((o) => o.id) }
          : { id: q.id, kind: q.type === 'multi' || q.type === 'skipClasses' ? 'multi' : 'single', options: q.options.map((o) => o.id) },
      ),
      axes: [...AXIS_IDS],
    }
    expect(now).toEqual(LAYOUT_V2)
    expect(CODE_VERSION).toBe(2)
  })

  it('round-trips every persona and reproduces the exact ranking', () => {
    for (const p of PERSONAS) {
      const code = encodeShareCode(p.answers, versions)
      const decoded = decodeShareCode(code)
      expect(decoded.answers).toEqual(canonical(p.answers))
      expect(JSON.stringify(rank(decoded.answers, data).results)).toBe(JSON.stringify(rank(p.answers, data).results))
    }
  })

  it('round-trips 300 random players and stays short', () => {
    for (let seed = 1; seed <= 300; seed++) {
      const answers = randomAnswers(seed, data)
      const code = encodeShareCode(answers, versions)
      expect(code).toMatch(/^v2\.[A-Za-z0-9_-]+$/)
      // 82 bits of answers plus 7 per tweak: at most 22 characters with the 4 tweak sliders the result page shows.
      expect(code.length).toBeLessThanOrEqual(22)
      expect(decodeShareCode(code).answers).toEqual(canonical(answers))
    }
  })

  it('still opens v1 links: they decode, rank with current data and say the results were updated', () => {
    // Made on Oct 20: practical packer, nobody left behind, backstage, must heal.
    const fixture = decodeShareCode('v1.IFhACAAjAAQA')
    expect(fixture.codeVersion).toBe(1)
    expect(fixture.answers.picks).toEqual({
      'group-project': 'nobody-behind', festival: 'backstage', packing: 'practical', preferences: ['must-heal'],
    })
    expect(rank(fixture.answers, data).results.length).toBeGreaterThan(0)
    expect(isOutdated(fixture, current)).toBe(true)

    // The cozy-healer persona as a v1 link, with a place to live: that answer no longer exists and is ignored.
    const old = decodeShareCode('v1.IEhRaVTiMYQA')
    expect(old.answers.picks.home).toBe('moon-forest')
    const rest = { ...old.answers.picks }
    delete rest.home
    expect(JSON.stringify(rank(old.answers, data))).toBe(JSON.stringify(rank({ ...old.answers, picks: rest }, data)))
    // Re-sharing it (e.g. after a tweak) makes a v2 link without the old answer.
    expect(decodeShareCode(encodeShareCode(old.answers, current)).answers.picks).toEqual(rest)
  })

  it('carries engine and data versions', () => {
    const code = encodeShareCode(PERSONAS[0]!.answers, { engineVersion: 3, dataVersion: 7 })
    const decoded = decodeShareCode(code)
    expect([decoded.engineVersion, decoded.dataVersion]).toEqual([3, 7])
    expect(isOutdated(decoded, { engineVersion: 3, dataVersion: 7 })).toBe(false)
    expect(isOutdated(decoded, { engineVersion: 3, dataVersion: 8 })).toBe(true)
  })

  it('rejects broken codes with a ShareCodeError', () => {
    for (const bad of ['', 'hello', 'v9.AAAA', 'v1.', 'v2.', 'v1.$$$', 'v1.AA', 'v2.AA']) {
      expect(() => decodeShareCode(bad), bad).toThrow(ShareCodeError)
    }
    // An out-of-range answer index (all bits set) must not decode into nonsense.
    expect(() => decodeShareCode('v1.' + '_'.repeat(16))).toThrow(ShareCodeError)
    expect(() => decodeShareCode('v2.' + '_'.repeat(20))).toThrow(ShareCodeError)
  })

  it('refuses to encode unknown option ids', () => {
    const bad: Answers = { ...PERSONAS[0]!.answers, picks: { festival: 'dance' } }
    expect(() => encodeShareCode(bad, versions)).toThrow(/unknown option/)
  })
})
