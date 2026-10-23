import type { Build, RacialTag } from '../data/schemas'
import { CONFIG } from './config'
import { entries, type EngineContext } from './context'
import { eligibleRaces } from './filters'
import type { PlayerProfile, RaceContribution, RaceResult } from './types'

type Needs = Partial<Record<RacialTag, number>>

/** What this build (and this player) gets out of racial traits. */
export function racialNeeds(build: Build, profile: PlayerProfile, ctx: EngineContext): Needs {
  const needs: Needs = {}
  const add = (source: Needs, scale = 1) => {
    for (const [tag, v] of entries(source)) needs[tag] = (needs[tag] ?? 0) + v * scale
  }
  const r = CONFIG.races
  add(r.baseNeeds)
  add(r.roleNeeds[build.role])
  for (const [axis, axisNeeds] of entries(r.axisNeeds)) {
    const weight = profile.axes[axis].weight
    if (weight > 0) add(axisNeeds, Math.min(r.axisNeedCap, weight / r.axisScale))
  }
  for (const [tag, multiplier] of entries(build.racialNeeds)) {
    if (needs[tag] != null) needs[tag] *= multiplier
  }
  const usesMana = ctx.classes.get(build.classId)?.resources.includes('mana') ?? true
  if (!usesMana && needs.manaRegen != null) needs.manaRegen *= r.nonManaFactor
  return needs
}

const tagValue = (tags: Needs, needs: Needs) => {
  let sum = 0
  for (const [tag, v] of entries(tags)) sum += v * (needs[tag] ?? 0)
  return sum
}

/** Step 5: every allowed race for this build, best first. */
export function rankRaces(build: Build, profile: PlayerProfile, ctx: EngineContext): RaceResult[] {
  const needs = racialNeeds(build, profile, ctx)
  const r = CONFIG.races
  const explanations = ctx.data.explanations

  const results = eligibleRaces(build.classId, profile.setup, ctx).map(({ race, newInForever }): RaceResult => {
    const contributions: RaceContribution[] = []
    for (const racial of race.racials) {
      contributions.push({ kind: 'racial', name: racial.name, value: tagValue(racial.tags, needs), effect: racial.effect })
    }
    for (const spell of race.classSpells?.[build.classId] ?? []) {
      contributions.push({ kind: 'classSpell', name: spell.name, value: tagValue(spell.tags, needs), effect: spell.effect })
    }
    let look = 0
    for (const [aesthetic, pref] of entries(profile.aesthetic)) look += (pref * (race.aesthetic[aesthetic] ?? 0)) / 3
    look *= r.aestheticWeight * (profile.setup.ruleset === 'rp' ? r.rpAestheticMultiplier : 1)
    if (look > 0) contributions.push({ kind: 'aesthetic', name: 'look', value: look })
    if (profile.novelty > 0 && newInForever) {
      contributions.push({ kind: 'novelty', name: 'new', value: r.noveltyBonus * profile.novelty })
    }
    const needsPack = race.requiresPurchase && profile.setup.skyborne === 'unsure'
    if (needsPack) contributions.push({ kind: 'purchase', name: 'pack', value: -r.unsurePenalty })

    const reasons = contributions
      .filter((c) => c.kind !== 'purchase' && c.value >= r.minReasonValue)
      .sort((a, b) => b.value - a.value)
      .slice(0, r.maxReasons)
      .map((c) => {
        if (c.kind === 'aesthetic') return { name: c.name, text: explanations.race.aesthetic }
        if (c.kind === 'novelty') return { name: c.name, text: explanations.race.novelty }
        const effect = c.effect ?? ''
        return { name: c.name, text: { newcomer: effect, veteran: effect } }
      })

    return {
      raceId: race.id,
      score: contributions.reduce((sum, c) => sum + c.value, 0),
      chosen: race.id === profile.race,
      newInForever,
      needsPack,
      contributions,
      reasons,
    }
  })

  // The race the player has in mind leads; the rest follow by how much their racials help.
  return results.sort(
    (a, b) =>
      Number(b.chosen) - Number(a.chosen) ||
      b.score - a.score ||
      (ctx.raceOrder.get(a.raceId) ?? 0) - (ctx.raceOrder.get(b.raceId) ?? 0),
  )
}
