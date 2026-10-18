import type { Build, ClassId, HardFilter, Race } from '../data/schemas'
import type { EngineContext } from './context'
import type { PlayerProfile, Setup } from './types'

/** Races that can be this class for the chosen faction and pack ownership. */
export function eligibleRaces(classId: ClassId, setup: Setup, ctx: EngineContext): { race: Race; newInForever: boolean }[] {
  return (ctx.combosByClass.get(classId) ?? []).filter(
    ({ race }) =>
      (setup.faction === 'any' || race.factions.includes(setup.faction)) &&
      (!race.requiresPurchase || setup.skyborne !== 'no'),
  )
}

/** Step 2: the first hard filter a build breaks, or null if it stays in the ranking. */
export function exclusionReason(build: Build, profile: PlayerProfile, ctx: EngineContext): HardFilter | 'noRace' | null {
  const filters = new Set(profile.filters)
  const classRoles = ctx.classes.get(build.classId)?.roles ?? []
  if (filters.has('noPets') && build.petStyle === 'required') return 'noPets'
  // Class-level: a second spec can cover healing/tanking (dual spec at 40).
  if (filters.has('mustHeal') && !classRoles.includes('healer')) return 'mustHeal'
  if (filters.has('mustTank') && !classRoles.includes('tank')) return 'mustTank'
  if (filters.has('rangedOnly') && build.axes.range < 3.5) return 'rangedOnly'
  if (filters.has('meleeOnly') && build.axes.range > 1.5) return 'meleeOnly'
  if (filters.has('noStealth') && build.stealth >= 2) return 'noStealth'
  if (eligibleRaces(build.classId, profile.setup, ctx).length === 0) return 'noRace'
  return null
}
