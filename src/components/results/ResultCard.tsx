import { useId, useState } from 'react'
import type { Wording } from '../../data'
import type { BuildResult, PlayerProfile } from '../../engine/types'
import { en } from '../../i18n/en'
import { ClassGlyph, RoleGlyph } from '../icons/Glyphs'
import { RadarChart } from './RadarChart'
import { buildInfo, ctx, MatchBadge, RaceList, radarAxes } from './shared'

type Props = { result: BuildResult; profile: PlayerProfile; wording: keyof Wording; featured?: boolean }

/**
 * A top-3 result. The #1 card opens fully; #2 and #3 start compact (match, reasons, a caveat, best race)
 * with the radar, all races, dual spec and Forever notes behind "Details".
 */
export function ResultCard({ result, profile, wording: w, featured = false }: Props) {
  const { build, cls } = buildInfo(result.buildId)
  const color = cls.colorHex
  const [open, setOpen] = useState(featured)
  const detailsId = useId()
  const dual = result.dualSpec ? ctx.builds.get(result.dualSpec.buildId) : undefined
  const watchOuts = open ? result.watchOuts : result.watchOuts.slice(0, 1)
  const races = open ? result.races : result.races.slice(0, 1)

  return (
    <article
      className="panel relative overflow-hidden p-5 sm:p-6"
      style={{ borderColor: `${color}55`, boxShadow: featured ? `0 0 60px -25px ${color}` : undefined }}
      aria-labelledby={`card-${build.id}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1" style={{ background: color }} />
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="mt-1 flex size-11 shrink-0 items-center justify-center rounded-xl border" style={{ borderColor: `${color}88`, color }}>
            <ClassGlyph classId={cls.id} className="size-7" />
          </span>
          <div>
            <p className="font-display text-xs tracking-[0.2em] text-ash-400 uppercase">#{result.rank}</p>
            <h2 id={`card-${build.id}`} className="text-2xl leading-tight" style={{ color }}>
              {build.name}
            </h2>
            <p className="flex items-center gap-1.5 text-sm text-ash-300">
              <RoleGlyph role={build.role} className="size-4" /> {build.tree} · {en.roles[build.role]}
            </p>
          </div>
        </div>
        <MatchBadge match={result.match} color={color} />
      </header>

      <p className="mt-4 text-parchment-100">{build.pitch[w]}</p>

      <div className={`mt-5 grid gap-6 ${open ? 'md:grid-cols-[1fr_220px]' : ''}`}>
        <div className="flex flex-col gap-4">
          <section>
            <h3 className="mb-2 text-base text-gold-300">{en.result.whyFits}</h3>
            <ul className="flex flex-col gap-1.5">
              {result.reasons.map((r, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-moss-400" aria-hidden="true">
                    ✓
                  </span>
                  {r.text[w]}
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h3 className="mb-2 text-base text-gold-300">{en.result.watchOut}</h3>
            <ul className="flex flex-col gap-1.5">
              {watchOuts.map((r, i) => (
                <li key={i} className="flex gap-2 text-ash-300">
                  <span className="text-ember-400" aria-hidden="true">
                    !
                  </span>
                  {r.text[w]}
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h3 className="mb-2 text-base text-gold-300">{en.result.bestRaces}</h3>
            <RaceList races={races} wording={w} />
          </section>
          {open && (
            <div id={detailsId} className="flex flex-col gap-4">
              {dual && result.dualSpec && (
                <section>
                  <h3 className="mb-1 text-base text-gold-300">{en.result.dualSpec}</h3>
                  <p>
                    <span className="font-semibold">{dual.name}</span>
                    <span className="text-ash-300"> · {result.dualSpec.reason[w]}</span>
                  </p>
                </section>
              )}
              <details className="text-sm text-ash-300">
                <summary className="cursor-pointer text-gold-300/90">{en.result.whatsNew}</summary>
                <ul className="mt-2 list-disc pl-5">
                  {build.newInForever.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </details>
              {build.confidence === 'low' && <p className="text-xs text-ash-400">{en.result.lowConfidence}</p>}
            </div>
          )}
          {!featured && (
            <button
              type="button"
              className="self-start text-sm text-gold-300 underline-offset-4 hover:underline"
              aria-expanded={open}
              aria-controls={detailsId}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? en.result.lessDetails : en.result.moreDetails}
            </button>
          )}
        </div>
        {open && (
          <RadarChart
            className="mx-auto w-full max-w-[240px]"
            color={color}
            title={en.result.youVsBuild}
            youLabel={en.result.you}
            buildLabel={en.result.build}
            points={radarAxes(profile).map((a) => ({
              label: ctx.axes.get(a)?.short ?? a,
              you: profile.axes[a].weight > 0 ? profile.axes[a].target : 2.5,
              build: build.axes[a],
            }))}
          />
        )}
      </div>
    </article>
  )
}
