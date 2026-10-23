import type { AxisId } from '../data/schemas'
import type { Answers, Setup, TweakLevel } from '../engine/types'
import { LAYOUT_V1, LAYOUT_V2, type Layout } from './layout'

// Share code: "v2." + base64url(bit-packed answers). The payload also carries the engine and data
// versions (mod 16 / mod 64) so the result page can say "results updated since this link was made".
// New codes use the newest layout; every older layout stays here so old links keep decoding.

export const CODE_VERSION = 2
const LAYOUTS: Record<number, Layout> = { 1: LAYOUT_V1, 2: LAYOUT_V2 }
const NEUTRAL_TWEAK = 4

export class ShareCodeError extends Error {}

export type DecodedShare = {
  codeVersion: number
  engineVersion: number
  dataVersion: number
  answers: Answers
}

const bitsFor = (values: number) => Math.max(1, Math.ceil(Math.log2(values)))

class BitWriter {
  private bits: number[] = []
  write(value: number, width: number) {
    if (value < 0 || value >= 2 ** width) throw new Error(`value ${value} does not fit in ${width} bits`)
    for (let i = width - 1; i >= 0; i--) this.bits.push((value >> i) & 1)
  }
  bytes(): Uint8Array {
    const out = new Uint8Array(Math.ceil(this.bits.length / 8))
    this.bits.forEach((bit, i) => {
      if (bit) out[i >> 3]! |= 0x80 >> (i & 7)
    })
    return out
  }
}

class BitReader {
  private pos = 0
  constructor(private readonly data: Uint8Array) {}
  read(width: number): number {
    let value = 0
    for (let i = 0; i < width; i++, this.pos++) {
      const byte = this.data[this.pos >> 3]
      if (byte === undefined) throw new ShareCodeError('share code is too short')
      value = (value << 1) | ((byte >> (7 - (this.pos & 7))) & 1)
    }
    return value
  }
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(text: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]+$/.test(text)) throw new ShareCodeError('share code has invalid characters')
  const base64 = text.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  try {
    return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0))
  } catch {
    throw new ShareCodeError('share code is not valid base64')
  }
}

const asList = (pick: Answers['picks'][string]): string[] => (pick == null ? [] : Array.isArray(pick) ? pick : [pick])

export function encodeShareCode(answers: Answers, versions: { engineVersion: number; dataVersion: number }): string {
  const layout = LAYOUTS[CODE_VERSION]!
  const w = new BitWriter()
  w.write(versions.engineVersion % 16, 4)
  w.write(versions.dataVersion % 64, 6)

  for (const field of ['experience', 'faction', 'ruleset', 'skyborne'] as const) {
    const options = layout.setup[field]
    const index = options.indexOf(answers.setup[field])
    if (index < 0) throw new Error(`unknown ${field} "${answers.setup[field]}"`)
    w.write(index, bitsFor(options.length))
  }

  for (const q of layout.questions) {
    const picks = asList(answers.picks[q.id])
    const indexOf = (id: string) => {
      const i = q.options.indexOf(id)
      if (i < 0) throw new Error(`unknown option "${id}" for ${q.id}`)
      return i
    }
    if (q.kind === 'single') {
      w.write(picks[0] == null ? 0 : indexOf(picks[0]) + 1, bitsFor(q.options.length + 1))
    } else if (q.kind === 'ranked') {
      for (let slot = 0; slot < q.slots; slot++) {
        const id = picks[slot]
        w.write(id == null ? 0 : indexOf(id) + 1, bitsFor(q.options.length + 1))
      }
    } else {
      const chosen = new Set(picks.map((id) => q.options[indexOf(id)]))
      for (const option of q.options) w.write(chosen.has(option) ? 1 : 0, 1)
    }
  }

  const tweaks = layout.axes
    .map((axis, index) => ({ index, level: answers.tweaks?.[axis as AxisId] }))
    .filter((t): t is { index: number; level: TweakLevel } => t.level != null && t.level !== NEUTRAL_TWEAK)
  w.write(tweaks.length, 4)
  for (const t of tweaks) {
    w.write(t.index, 4)
    w.write(t.level, 3)
  }

  return `v${CODE_VERSION}.${toBase64Url(w.bytes())}`
}

export function decodeShareCode(code: string): DecodedShare {
  const match = /^v(\d+)\.(.+)$/.exec(code.trim())
  if (!match) throw new ShareCodeError('not a share code')
  const codeVersion = Number(match[1])
  const layout = LAYOUTS[codeVersion]
  if (!layout) throw new ShareCodeError(`unknown share code version ${codeVersion}`)
  const r = new BitReader(fromBase64Url(match[2]!))

  const engineVersion = r.read(4)
  const dataVersion = r.read(6)
  const choose = (options: readonly string[], label: string) => {
    const index = r.read(bitsFor(options.length))
    const value = options[index]
    if (value === undefined) throw new ShareCodeError(`invalid ${label}`)
    return value
  }
  const setup = {
    experience: choose(layout.setup.experience, 'experience'),
    faction: choose(layout.setup.faction, 'faction'),
    ruleset: choose(layout.setup.ruleset, 'ruleset'),
    skyborne: choose(layout.setup.skyborne, 'skyborne'),
  } as Setup

  const picks: Answers['picks'] = {}
  const option = (options: readonly string[], value: number, label: string) => {
    const id = options[value - 1]
    if (id === undefined) throw new ShareCodeError(`invalid answer for ${label}`)
    return id
  }
  for (const q of layout.questions) {
    if (q.kind === 'single') {
      const value = r.read(bitsFor(q.options.length + 1))
      if (value > 0) picks[q.id] = option(q.options, value, q.id)
    } else if (q.kind === 'ranked') {
      const ids: string[] = []
      for (let slot = 0; slot < q.slots; slot++) {
        const value = r.read(bitsFor(q.options.length + 1))
        if (value > 0) ids.push(option(q.options, value, q.id))
      }
      if (ids.length > 0) picks[q.id] = ids
    } else {
      const ids = q.options.filter(() => r.read(1) === 1)
      if (ids.length > 0) picks[q.id] = ids
    }
  }

  const answers: Answers = { setup, picks }
  const count = r.read(4)
  for (let i = 0; i < count; i++) {
    const axis = layout.axes[r.read(4)]
    const level = r.read(3) as TweakLevel
    if (axis === undefined) throw new ShareCodeError('invalid tweak')
    answers.tweaks = { ...answers.tweaks, [axis]: level }
  }
  return { codeVersion, engineVersion, dataVersion, answers }
}

/** True when a link was made with an older engine or data set (results were recomputed). */
export function isOutdated(decoded: DecodedShare, current: { engineVersion: number; dataVersion: number }): boolean {
  return decoded.engineVersion !== current.engineVersion % 16 || decoded.dataVersion !== current.dataVersion % 64
}
