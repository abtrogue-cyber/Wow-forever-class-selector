import type { Build, ClassId, Race, Role } from '../data/schemas'
import type { EngineContext } from './context'
import type { ExclusionReason, PlayerProfile, Setup } from './types'

/** Whether the player can make this race at all with their faction and pack ownership. */
export function raceAllowed(race: Race, setup: Setup): boolean {
  return (setup.faction === 'any' || race.factions.includes(setup.faction)) && (!race.requiresPurchase || setup.skyborne !== 'no')
}

/** Races that can be this class for the chosen faction and pack ownership. */
export function eligibleRaces(classId: ClassId, setup: Setup, ctx: EngineContext): { race: Race; newInForever: boolean }[] {
  return (ctx.combosByClass.get(classId) ?? []).filter(({ race }) => raceAllowed(race, setup))
}

/** The roles of this class the player hasn't ruled out with "no healing" / "no tanking". */
export function openRoles(classId: ClassId, profile: PlayerProfile, ctx: EngineContext): Role[] {
  const roles = ctx.classes.get(classId)?.roles ?? []
  return roles.filter((r) => !(r === 'healer' && profile.filters.includes('noHeal')) && !(r === 'tank' && profile.filters.includes('noTank')))
}

/** Step 2: the first hard filter a build breaks, or null if it stays in the ranking. */
export function exclusionReason(build: Build, profile: PlayerProfile, ctx: EngineContext): ExclusionReason | null {
  const filters = new Set(profile.filters)
  const classRoles = ctx.classes.get(build.classId)?.roles ?? []
  if (profile.skippedClasses.includes(build.classId)) return 'skippedClass'
  if (profile.race && !(ctx.combosByClass.get(build.classId) ?? []).some(({ race }) => race.id === profile.race)) return 'wrongRace'
  if (filters.has('noPets') && build.petStyle === 'required') return 'noPets'
  // Class-level: a second spec can cover healing/tanking (dual spec at 40).
  if (filters.has('mustHeal') && !classRoles.includes('healer')) return 'mustHeal'
  if (filters.has('mustTank') && !classRoles.includes('tank')) return 'mustTank'
  // Build-level: the class stays, its healer or tank specs go.
  if (filters.has('noHeal') && build.role === 'healer') return 'noHeal'
  if (filters.has('noTank') && build.role === 'tank') return 'noTank'
  if (filters.has('rangedOnly') && build.axes.range < 3.5) return 'rangedOnly'
  if (filters.has('meleeOnly') && build.axes.range > 1.5) return 'meleeOnly'
  if (filters.has('noStealth') && build.stealth >= 2) return 'noStealth'
  if (eligibleRaces(build.classId, profile.setup, ctx).length === 0) return 'noRace'
  return null
}
