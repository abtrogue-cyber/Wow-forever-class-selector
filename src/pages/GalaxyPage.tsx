import { useReducedMotion } from 'motion/react'
import { lazy, Suspense, useMemo, useState } from 'react'
import { Link } from 'wouter'
import { CLASS_IDS, gameData, type AxisId, type Wording } from '../data'
import { GalaxyMap2D } from '../components/galaxy/GalaxyMap2D'
import { can3d, Fallback, isLowPower } from '../components/hero/HeroStage'
import { ClassGlyph, RoleGlyph } from '../components/icons/Glyphs'
import { Page } from '../components/layout/Site'
import { buildInfo, ctx } from '../components/results/shared'
import { rank } from '../engine/rank'
import { buildGalaxy, playerAxes, topAxes } from '../galaxy/pca'
import { en } from '../i18n/en'
import { decodeShareCode } from '../share/codec'
import { wordingFor } from '../state/quizStore'
import type { GalaxyStar } from '../three/GalaxyScene'

const GalaxyScene = lazy(() => import('../three/GalaxyScene'))
const galaxy = buildGalaxy(gameData.builds)

const short = (a: AxisId) => ctx.axes.get(a)?.short ?? a
/** "Dungeon ↔ Solo & Gold": which axes grow toward each end of a direction. */
function directionText(c: number, flip: boolean): string {
  const top = topAxes(galaxy.components[c]!, 3)
  const pos = top.filter((t) => t.sign > 0).map((t) => short(t.axis))
  const neg = top.filter((t) => t.sign < 0).map((t) => short(t.axis))
  const side = (names: string[], other: string[]) => (names.length > 0 ? names.join(' & ') : `less ${other.join(' & ')}`)
  const [a, b] = [side(neg, pos), side(pos, neg)]
  return flip ? `${b} ↔ ${a}` : `${a} ↔ ${b}`
}

export function GalaxyPage({ code }: { code?: string }) {
  const reducedMotion = useReducedMotion() ?? false
  const answers = useMemo(() => {
    if (!code) return null
    try {
      return decodeShareCode(decodeURIComponent(code)).answers
    } catch {
      return null
    }
  }, [code])
  const result = useMemo(() => (answers ? rank(answers, gameData) : null), [answers])
  const w: keyof Wording = answers ? wordingFor(answers.setup) : 'newcomer'

  const stars: GalaxyStar[] = useMemo(() => {
    const excluded = new Set(result?.excluded.map((e) => e.buildId))
    return gameData.builds.map((b) => ({
      id: b.id,
      name: b.name,
      color: ctx.classes.get(b.classId)!.colorHex,
      pos: galaxy.stars.get(b.id)!,
      dim: excluded.has(b.id),
    }))
  }, [result])
  const you = useMemo(
    () =>
      result
        ? { pos: galaxy.project(playerAxes(result.profile, gameData.builds)), label: en.galaxy.you, links: result.results.slice(0, 3).map((r) => r.buildId) }
        : null,
    [result],
  )

  const [selected, setSelected] = useState<string | null>(() => result?.results[0]?.buildId ?? null)
  const [view, setView] = useState<'3d' | 'flat'>(() => (can3d() ? '3d' : 'flat'))
  const [ready3d, setReady3d] = useState(false)
  const flat = <GalaxyMap2D stars={stars} you={you} selected={selected} onSelect={setSelected} />

  return (
    <Page>
      <div className="flex flex-col gap-5 py-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl sm:text-4xl">{en.galaxy.title}</h1>
          <p className="max-w-2xl text-ash-300">
            {en.galaxy.lead} {you && en.galaxy.leadYou}
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="flex flex-col gap-2">
            <div className="panel relative h-[52vh] min-h-[320px] overflow-hidden lg:h-[540px]">
              {view === '3d' ? (
                <>
                  {/* The flat map stays visible until the 3D view has drawn its first frame. */}
                  {!ready3d && <div className="absolute inset-0">{flat}</div>}
                  <Fallback fallback={flat}>
                    <Suspense fallback={null}>
                      <div className={`absolute inset-0 transition-opacity duration-500 ${ready3d ? 'opacity-100' : 'opacity-0'}`}>
                        <GalaxyScene
                          stars={stars}
                          you={you}
                          selected={selected}
                          onSelect={setSelected}
                          reducedMotion={reducedMotion}
                          lowPower={isLowPower()}
                          onReady={() => window.setTimeout(() => setReady3d(true), 150)}
                        />
                      </div>
                    </Suspense>
                  </Fallback>
                </>
              ) : (
                flat
              )}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ash-400">
              <span>{view === '3d' ? en.galaxy.hint3d : en.galaxy.hint}</span>
              {can3d() && (
                <div role="group" aria-label={en.galaxy.viewLabel} className="flex gap-1">
                  {(['3d', 'flat'] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      aria-pressed={view === v}
                      onClick={() => {
                        if (v !== view) setReady3d(false)
                        setView(v)
                      }}
                      className="rounded-full border border-night-600 px-3 py-1 aria-pressed:border-gold-400 aria-pressed:text-gold-300"
                    >
                      {v === '3d' ? en.galaxy.view3d : en.galaxy.viewFlat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            <StarDetails id={selected} result={result} w={w} onSelect={setSelected} />
            <section className="panel p-4 text-sm" aria-labelledby="directions-title">
              <h2 id="directions-title" className="text-base">
                {en.galaxy.directions}
              </h2>
              <dl className="mt-2 flex flex-col gap-1.5 text-ash-300">
                {[0, 1, 2].map((c) => (
                  <div key={c}>
                    <dt className="text-xs text-ash-400">{en.galaxy.direction[c]}</dt>
                    <dd>{directionText(c, c === 2)}</dd>
                  </div>
                ))}
              </dl>
            </section>
            {code && result ? (
              <Link href={`/result/${code}`} className="btn-ghost self-start">
                ← {en.galaxy.toResults}
              </Link>
            ) : (
              <Link href="/quiz" className="btn-primary self-start">
                {en.galaxy.takeQuiz}
              </Link>
            )}
          </aside>
        </div>

        <section aria-labelledby="all-builds" className="flex flex-col gap-3">
          <h2 id="all-builds" className="text-xl">
            {en.galaxy.listTitle}
          </h2>
          <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {CLASS_IDS.map((classId) => {
              const cls = ctx.classes.get(classId)!
              return (
                <li key={classId} className="flex flex-col gap-1">
                  <span className="flex items-center gap-2 font-display text-sm tracking-wider uppercase" style={{ color: cls.colorHex }}>
                    <ClassGlyph classId={classId} className="size-4" />
                    {cls.name}
                  </span>
                  <span className="flex flex-wrap gap-1.5">
                    {gameData.builds
                      .filter((b) => b.classId === classId)
                      .map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          aria-pressed={selected === b.id}
                          aria-label={b.name}
                          onClick={() => setSelected(b.id)}
                          className="rounded-full border border-night-600 px-2.5 py-0.5 text-xs text-ash-300 hover:text-parchment-100 aria-pressed:border-gold-400 aria-pressed:text-parchment-100"
                        >
                          {b.tree}
                        </button>
                      ))}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      </div>
    </Page>
  )
}

function StarDetails({ id, result, w, onSelect }: {
  id: string | null
  result: ReturnType<typeof rank> | null
  w: keyof Wording
  onSelect: (id: string) => void
}) {
  if (!id) return <p className="panel p-4 text-sm text-ash-300">{en.galaxy.hint}</p>
  const { build, cls } = buildInfo(id)
  const mine = result?.results.find((r) => r.buildId === id)
  const ruledOut = result?.excluded.some((e) => e.buildId === id)
  return (
    <section className="panel flex flex-col gap-3 p-4" aria-live="polite" aria-labelledby="star-title">
      <div className="flex items-center gap-3">
        <ClassGlyph classId={cls.id} className="size-8 shrink-0" />
        <div>
          <h2 id="star-title" className="text-xl leading-tight" style={{ color: cls.colorHex }}>
            {build.name}
          </h2>
          <p className="flex items-center gap-1.5 text-xs text-ash-400">
            <RoleGlyph role={build.role} className="size-3.5" />
            {en.roles[build.role]}
          </p>
        </div>
      </div>
      {mine && <p className="text-sm text-gold-300">{en.galaxy.yourRank(mine.rank, mine.match)}</p>}
      {ruledOut && <p className="text-sm text-ash-400">{en.galaxy.excluded}</p>}
      <p className="text-sm text-ash-300">{build.pitch[w]}</p>
      <div>
        <p className="text-xs text-ash-400">{en.galaxy.closest}</p>
        <ul className="mt-1 flex flex-wrap gap-1.5">
          {galaxy.neighbors(id, 3).map((n) => {
            const info = buildInfo(n)
            return (
              <li key={n}>
                <button
                  type="button"
                  onClick={() => onSelect(n)}
                  className="rounded-full border border-night-600 px-2.5 py-0.5 text-xs hover:border-parchment-200"
                  style={{ color: info.cls.colorHex }}
                >
                  {info.build.name}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
