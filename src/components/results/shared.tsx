import { AXIS_IDS, gameData, type AxisId, type Build, type GameClass, type Wording } from '../../data'
import { getContext } from '../../engine/context'
import type { PlayerProfile, RaceResult } from '../../engine/types'
import { en } from '../../i18n/en'

export const ctx = getContext(gameData)

export function buildInfo(buildId: string): { build: Build; cls: GameClass } {
  const build = ctx.builds.get(buildId)!
  return { build, cls: ctx.classes.get(build.classId)! }
}

const DEFAULT_RADAR: AxisId[] = ['soloLeveling', 'survivability', 'sustain', 'groupUtility', 'complexity', 'range']

/** The axes that matter most to this player (at least 5), for the radar. */
export function radarAxes(profile: PlayerProfile, max = 7): AxisId[] {
  const weighted = AXIS_IDS.filter((a) => profile.axes[a].weight > 0).sort((a, b) => profile.axes[b].weight - profile.axes[a].weight)
  const chosen = weighted.slice(0, max)
  for (const a of DEFAULT_RADAR) if (chosen.length < 5 && !chosen.includes(a)) chosen.push(a)
  return chosen
}

export function RaceList({ races, wording }: { races: RaceResult[]; wording: keyof Wording }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {races.map((race, i) => (
        <li key={race.raceId} className="flex flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className={i === 0 ? 'font-semibold text-parchment-100' : 'text-parchment-200'}>{ctx.races.get(race.raceId)?.name}</span>
            {race.newInForever && (
              <span className="rounded-full border border-gold-500/60 px-2 py-0.5 text-[11px] text-gold-300">★ {en.result.newCombo}</span>
            )}
            {race.needsPack && (
              <span className="rounded-full border border-ash-400/50 px-2 py-0.5 text-[11px] text-ash-300">{en.result.needsPack}</span>
            )}
          </div>
          {race.reasons.length > 0 && (
            <p className="text-sm text-ash-400">
              {race.reasons.map((r) => (r.name === 'look' || r.name === 'new' ? r.text[wording] : `${r.name}: ${r.text[wording]}`)).join(' · ')}
            </p>
          )}
        </li>
      ))}
    </ul>
  )
}

export function MatchBadge({ match, color, size = 'lg' }: { match: number; color: string; size?: 'lg' | 'sm' }) {
  return (
    <div className="flex flex-col items-end leading-none">
      <span className={`font-display font-semibold ${size === 'lg' ? 'text-4xl' : 'text-xl'}`} style={{ color }}>
        {match}%
      </span>
      <span className="mt-1 text-[11px] tracking-widest text-ash-400 uppercase">{en.result.match}</span>
    </div>
  )
}
