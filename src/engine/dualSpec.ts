import type { Build, Role, Wording } from '../data/schemas'
import type { EngineContext } from './context'
import { exclusionReason } from './filters'
import { buildProfile, swapTopPriorities } from './profile'
import { scoreBuild } from './score'
import type { Answers, PlayerProfile } from './types'

function best(builds: Build[], profile: PlayerProfile, ctx: EngineContext): Build | null {
  let top: Build | null = null
  let topScore = -Infinity
  for (const b of builds) {
    const s = scoreBuild(b, profile, ctx)
    if (s > topScore + 1e-9) {
      top = b
      topScore = s
    }
  }
  return top
}

/** Step 7: the second spec of the same class. Satisfies must-heal/tank first, else serves priority #2. */
export function pickDualSpec(
  main: Build,
  answers: Answers,
  profile: PlayerProfile,
  ctx: EngineContext,
): { buildId: string; reason: Wording } | null {
  const ex = ctx.data.explanations.dualSpec
  const sameClass = ctx.data.builds.filter((b) => b.classId === main.classId && b.id !== main.id)

  const neededRoles: Role[] = []
  if (profile.filters.includes('mustHeal') && main.role !== 'healer') neededRoles.push('healer')
  if (profile.filters.includes('mustTank') && main.role !== 'tank') neededRoles.push('tank')
  if (neededRoles.length > 0) {
    const pick = best(sameClass.filter((b) => neededRoles.includes(b.role)), profile, ctx)
    if (pick) return { buildId: pick.id, reason: pick.role === 'healer' ? ex.heal : ex.tank }
  }

  const partners = main.dualSpecPartners
    .map((id) => ctx.builds.get(id))
    .filter((b): b is Build => b != null && exclusionReason(b, profile, ctx) === null)
  const second = profile.priorities[1]
  if (!second) {
    const pick = best(partners, profile, ctx)
    return pick ? { buildId: pick.id, reason: ex.generic } : null
  }
  // The second spec serves priority #2: rank by that axis first, then by overall fit with #2 promoted.
  const secondary = buildProfile(swapTopPriorities(answers, ctx), ctx)
  const ranked = partners
    .map((b) => ({ b, axis: b.axes[second], fit: scoreBuild(b, secondary, ctx) }))
    .sort((x, y) => y.axis - x.axis || y.fit - x.fit)
  const pick = ranked[0]?.b
  return pick ? { buildId: pick.id, reason: ex.priority[second] ?? ex.generic } : null
}
