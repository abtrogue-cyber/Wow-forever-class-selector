import type { Build, GameData } from '../data/schemas'
import { CONFIG, ENGINE_VERSION } from './config'
import { getContext } from './context'
import { pickDualSpec } from './dualSpec'
import { exclusionText, explainBuild, watchReason, withRelativeContributions } from './explain'
import { exclusionReason } from './filters'
import { buildProfile } from './profile'
import { rankRaces } from './races'
import { componentFits, toMatch, weightedScore, type RawComponent } from './score'
import type { Answers, BuildResult, ExcludedBuild, RankResult, WhyNot } from './types'

const round9 = (x: number) => Math.round(x * 1e9) / 1e9

/** The whole engine: answers in, ranked and explained builds out. Pure and deterministic. */
export function rank(answers: Answers, data: GameData): RankResult {
  const ctx = getContext(data)
  const profile = buildProfile(answers, ctx)

  const eligible: { build: Build; order: number; raw: RawComponent[]; score: number }[] = []
  const excluded: ExcludedBuild[] = []
  data.builds.forEach((build, order) => {
    const reason = exclusionReason(build, profile, ctx)
    if (reason) {
      excluded.push({ buildId: build.id, reason })
      return
    }
    const raw = componentFits(build, profile, ctx)
    eligible.push({ build, order, raw, score: weightedScore(raw) })
  })

  const components = withRelativeContributions(eligible.map((e) => e.raw))
  const scored = eligible.map((e, i) => ({ ...e, components: components[i] ?? [] }))
  scored.sort((a, b) => round9(b.score) - round9(a.score) || a.order - b.order)

  const results: BuildResult[] = scored.map((s, i) => {
    const { reasons, watchOuts } = explainBuild(s.build, s.components, profile, ctx)
    const races = rankRaces(s.build, profile, ctx).slice(0, 3)
    return {
      buildId: s.build.id,
      rank: i + 1,
      score: s.score,
      match: toMatch(s.score),
      components: s.components,
      reasons,
      watchOuts,
      races,
      dualSpec: pickDualSpec(s.build, answers, profile, ctx),
      newCombo: races[0]?.newInForever ?? false,
    }
  })

  // "Why not …?": the popular picks a player might expect that missed the top 5. First the famous spec of
  // the #1 class (e.g. "Why not Beast Mastery?" for a Marksmanship result), then the nearest misses, one per
  // class where possible, excluded builds last — each with its main reason.
  const ex = data.explanations
  const top = new Set(results.slice(0, CONFIG.explain.whyNotSkipTop).map((r) => r.buildId))
  const rankOf = (id: string) => results.find((r) => r.buildId === id)?.rank ?? Number.MAX_SAFE_INTEGER
  const candidates = data.builds
    .filter((b) => b.popular && !top.has(b.id))
    .sort((a, b) => rankOf(a.id) - rankOf(b.id) || (ctx.buildOrder.get(a.id) ?? 0) - (ctx.buildOrder.get(b.id) ?? 0))
  const chosen: Build[] = []
  const firstClass = ctx.builds.get(results[0]?.buildId ?? '')?.classId
  const sameClass = candidates.find((b) => b.classId === firstClass)
  if (sameClass) chosen.push(sameClass)
  for (const b of candidates) {
    if (chosen.length < CONFIG.explain.whyNotCount && !chosen.some((c) => c.classId === b.classId)) chosen.push(b)
  }
  for (const b of candidates) {
    if (chosen.length < CONFIG.explain.whyNotCount && !chosen.includes(b)) chosen.push(b)
  }
  const whyNot: WhyNot[] = chosen.map((b) => {
    const out = excluded.find((e) => e.buildId === b.id)
    if (out) return { buildId: b.id, rank: null, match: null, reason: exclusionText(out.reason, ctx) }
    const result = results.find((r) => r.buildId === b.id)
    const worst = result ? [...result.components].sort((x, y) => x.rel - y.rel)[0] : undefined
    const reason =
      (worst && worst.rel < 0 ? watchReason(worst, b, profile, ctx)?.text : undefined) ??
      result?.watchOuts[0]?.text ??
      b.weaknesses[0]?.text ??
      ex.dualSpec.generic
    return { buildId: b.id, rank: result?.rank ?? null, match: result?.match ?? null, reason }
  })

  const notes = []
  if (results.length === 0) notes.push(ex.notes.nothingLeft)
  else if ((results[0]?.match ?? 0) < CONFIG.explain.contradictoryBelow) notes.push(ex.notes.contradictory)

  return {
    engineVersion: ENGINE_VERSION,
    dataVersion: data.meta.dataVersion,
    profile,
    results,
    excluded,
    whyNot,
    notes,
  }
}
