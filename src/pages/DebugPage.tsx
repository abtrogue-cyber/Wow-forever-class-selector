// Dev-only engine inspector: answer every question, see the raw profile, scores and contributions.
// Not translated on purpose (developer tool); never shipped in production builds.
import { useMemo, useState } from 'react'
import { AXIS_IDS, gameData, type AxisId, type Wording } from '../data'
import { ENGINE_VERSION } from '../engine/config'
import { getContext } from '../engine/context'
import { buildProfile } from '../engine/profile'
import { PERSONAS } from '../engine/personas'
import { rank } from '../engine/rank'
import { rankRaces } from '../engine/races'
import type { Answers, Setup, TweakLevel } from '../engine/types'
import { decodeShareCode, encodeShareCode } from '../share/codec'

const ctx = getContext(gameData)
const versions = { engineVersion: ENGINE_VERSION, dataVersion: gameData.meta.dataVersion }
const EMPTY: Answers = { setup: { experience: 'played', faction: 'any', ruleset: 'normal', skyborne: 'no' }, picks: {} }

const pct = (x: number) => `${x >= 0 ? '+' : ''}${(x * 100).toFixed(1)}`
const buildName = (id: string) => ctx.builds.get(id)?.name ?? id
const classColor = (id: string) => ctx.classes.get(ctx.builds.get(id)?.classId ?? 'warrior')?.colorHex ?? '#888'
const raceName = (id: string) => ctx.races.get(id)?.name ?? id

const select = 'rounded border border-night-600 bg-night-800 px-1 py-0.5 text-sm'
const card = 'rounded-lg border border-night-700 bg-night-900 p-3'

export default function DebugPage() {
  const [answers, setAnswers] = useState<Answers>(PERSONAS[0]!.answers)
  const [wording, setWording] = useState<keyof Wording>('veteran')
  const [selected, setSelected] = useState<string | null>(null)
  const [pasted, setPasted] = useState('')
  const [codeError, setCodeError] = useState('')

  const result = useMemo(() => rank(answers, gameData), [answers])
  const code = useMemo(() => encodeShareCode(answers, versions), [answers])
  const roundTrips = useMemo(
    () => JSON.stringify(rank(decodeShareCode(code).answers, gameData).results) === JSON.stringify(result.results),
    [code, result],
  )
  const detail = result.results.find((r) => r.buildId === (selected ?? result.results[0]?.buildId))
  const t = (w: Wording) => w[wording]

  const setSetup = <K extends keyof Setup>(key: K, value: Setup[K]) => setAnswers((a) => ({ ...a, setup: { ...a.setup, [key]: value } }))
  const setPick = (id: string, value: string | string[] | undefined) =>
    setAnswers((a) => {
      const picks = { ...a.picks }
      if (value === undefined || (Array.isArray(value) && value.length === 0)) delete picks[id]
      else picks[id] = value
      return { ...a, picks }
    })
  const setTweak = (axis: AxisId, level: TweakLevel) =>
    setAnswers((a) => {
      const tweaks = { ...a.tweaks, [axis]: level }
      if (level === 4) delete tweaks[axis]
      return { ...a, tweaks }
    })

  const loadCode = () => {
    try {
      setAnswers(decodeShareCode(pasted).answers)
      setCodeError('')
    } catch (e) {
      setCodeError((e as Error).message)
    }
  }

  return (
    <main className="mx-auto max-w-[1400px] p-4 text-sm">
      <header className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h1 className="text-xl font-semibold text-gold-400">Engine debug</h1>
        <span className="text-ash-400">
          engine v{ENGINE_VERSION} · data v{gameData.meta.dataVersion} ({gameData.meta.gameState}) · dev only
        </span>
        <label className="ml-auto flex items-center gap-2">
          Wording
          <select className={select} value={wording} onChange={(e) => setWording(e.target.value as keyof Wording)}>
            <option value="newcomer">newcomer</option>
            <option value="veteran">veteran</option>
          </select>
        </label>
      </header>

      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        {/* ------------------------------------------------ inputs */}
        <section className="flex flex-col gap-3">
          <div className={card}>
            <label className="flex items-center gap-2">
              Persona
              <select
                className={`${select} flex-1`}
                value={PERSONAS.find((p) => p.answers === answers)?.id ?? ''}
                onChange={(e) => {
                  const p = PERSONAS.find((x) => x.id === e.target.value)
                  setAnswers(p ? p.answers : EMPTY)
                  setSelected(null)
                }}
              >
                <option value="">— custom / empty —</option>
                {PERSONAS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className={`${card} grid grid-cols-2 gap-2`}>
            {gameData.questions.setup.map((field) => (
              <label key={field.id} className="flex flex-col gap-1">
                <span className="text-ash-400">{field.id}</span>
                <select
                  className={select}
                  value={answers.setup[field.id]}
                  onChange={(e) => setSetup(field.id, e.target.value as never)}
                >
                  {field.options.map((o) => (
                    <option key={o.id} value={o.id}>
                      {t(o.label)}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          <div className={`${card} flex flex-col gap-3`}>
            {gameData.questions.questions.map((q) => {
              const pick = answers.picks[q.id]
              const list = pick == null ? [] : Array.isArray(pick) ? pick : [pick]
              return (
                <div key={q.id} className="flex flex-col gap-1">
                  <span className="text-ash-400">
                    {q.id} <span className="text-night-600">({q.type})</span>
                  </span>
                  {q.type === 'priorities' ? (
                    <div className="flex gap-1">
                      {[0, 1, 2].map((slot) => (
                        <select
                          key={slot}
                          className={`${select} flex-1`}
                          value={list[slot] ?? ''}
                          onChange={(e) => {
                            const next = [...list]
                            next[slot] = e.target.value
                            setPick(q.id, next.filter((x, i) => x && next.indexOf(x) === i))
                          }}
                        >
                          <option value="">#{slot + 1} —</option>
                          {q.options.map((o) => (
                            <option key={o.id} value={o.id}>
                              {t(o.label)}
                            </option>
                          ))}
                        </select>
                      ))}
                    </div>
                  ) : q.type === 'multi' || q.type === 'skipClasses' ? (
                    <div className="flex flex-wrap gap-x-3">
                      {q.options.map((o) => (
                        <label key={o.id} className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={list.includes(o.id)}
                            onChange={(e) =>
                              setPick(q.id, e.target.checked ? [...list, o.id] : list.filter((x) => x !== o.id))
                            }
                          />
                          {t(o.label)}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <select
                      className={select}
                      value={list[0] ?? ''}
                      onChange={(e) => setPick(q.id, e.target.value || undefined)}
                    >
                      <option value="">— skip —</option>
                      {q.options.map((o) => (
                        <option key={o.id} value={o.id}>
                          {t(answers.setup.ruleset === 'hardcore' && 'hardcoreLabel' in o && o.hardcoreLabel ? o.hardcoreLabel : o.label)}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )
            })}
          </div>

          <details className={card}>
            <summary className="cursor-pointer">Tweak sliders (weight multipliers)</summary>
            <div className="mt-2 grid grid-cols-2 gap-1">
              {AXIS_IDS.map((axis) => (
                <label key={axis} className="flex items-center justify-between gap-2">
                  {axis}
                  <select
                    className={select}
                    value={answers.tweaks?.[axis] ?? 4}
                    onChange={(e) => setTweak(axis, Number(e.target.value) as TweakLevel)}
                  >
                    {[0, 0.25, 0.5, 0.75, 1, 1.5, 2, 3].map((m, i) => (
                      <option key={i} value={i}>
                        ×{m}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </details>

          <div className={`${card} flex flex-col gap-2`}>
            <div>
              Share code: <code className="text-gold-300">{code}</code>{' '}
              <span className={roundTrips ? 'text-green-400' : 'text-red-400'}>{roundTrips ? '✓ round-trips' : '✗ mismatch'}</span>
            </div>
            <div className="flex gap-1">
              <input
                className={`${select} flex-1`}
                placeholder="paste a v1. code"
                value={pasted}
                onChange={(e) => setPasted(e.target.value)}
              />
              <button className={select} onClick={loadCode}>
                Load
              </button>
            </div>
            {codeError && <span className="text-red-400">{codeError}</span>}
          </div>
        </section>

        {/* ------------------------------------------------ outputs */}
        <section className="flex min-w-0 flex-col gap-4">
          {result.notes.length > 0 && (
            <div className={`${card} border-gold-500 text-gold-300`}>{result.notes.map(t).join(' ')}</div>
          )}

          <div className={`${card} overflow-x-auto`}>
            <h2 className="mb-2 font-semibold">Ranking ({result.results.length} eligible)</h2>
            <table className="w-full border-collapse">
              <thead className="text-left text-ash-400">
                <tr>
                  <th className="pr-2">#</th>
                  <th className="pr-2">Build</th>
                  <th className="pr-2 text-right">Match</th>
                  <th className="pr-2 text-right">Raw</th>
                  <th className="pr-2">Top contributions (% of score vs average)</th>
                  <th className="pr-2">Best race</th>
                  <th>Dual spec</th>
                </tr>
              </thead>
              <tbody>
                {result.results.map((r) => (
                  <tr
                    key={r.buildId}
                    onClick={() => setSelected(r.buildId)}
                    className={`cursor-pointer border-t border-night-800 hover:bg-night-800 ${r.buildId === detail?.buildId ? 'bg-night-800' : ''}`}
                  >
                    <td className="pr-2">{r.rank}</td>
                    <td className="pr-2 whitespace-nowrap">
                      <span className="mr-1 inline-block size-2 rounded-full" style={{ background: classColor(r.buildId) }} />
                      {buildName(r.buildId)}
                      {r.newCombo && <span className="ml-1 text-gold-400">★</span>}
                    </td>
                    <td className="pr-2 text-right font-semibold">{r.match}%</td>
                    <td className="pr-2 text-right text-ash-400">{r.score.toFixed(3)}</td>
                    <td className="pr-2 text-ash-400">
                      {[...r.components]
                        .sort((a, b) => Math.abs(b.rel) - Math.abs(a.rel))
                        .slice(0, 3)
                        .map((c) => `${c.id} ${pct(c.rel)}`)
                        .join(' · ')}
                    </td>
                    <td className="pr-2 whitespace-nowrap">{r.races[0] ? raceName(r.races[0].raceId) : '—'}</td>
                    <td className="whitespace-nowrap text-ash-400">{r.dualSpec ? buildName(r.dualSpec.buildId) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {detail && (
            <div className={`${card} grid gap-4 xl:grid-cols-2`}>
              <div>
                <h2 className="mb-2 font-semibold" style={{ color: classColor(detail.buildId) }}>
                  #{detail.rank} {buildName(detail.buildId)} · {detail.match}%
                </h2>
                <h3 className="text-ash-400">Why it fits</h3>
                <ul className="mb-2 list-disc pl-5">
                  {detail.reasons.map((r, i) => (
                    <li key={i}>
                      {t(r.text)} <span className="text-night-600">[{r.source}]</span>
                    </li>
                  ))}
                </ul>
                <h3 className="text-ash-400">Watch out</h3>
                <ul className="mb-2 list-disc pl-5">
                  {detail.watchOuts.map((r, i) => (
                    <li key={i}>
                      {t(r.text)} <span className="text-night-600">[{r.source}]</span>
                    </li>
                  ))}
                </ul>
                {detail.dualSpec && (
                  <p>
                    <span className="text-ash-400">Dual spec:</span> {buildName(detail.dualSpec.buildId)}: {t(detail.dualSpec.reason)}
                  </p>
                )}
                <h3 className="mt-3 text-ash-400">Components</h3>
                <table className="w-full">
                  <thead className="text-left text-ash-400">
                    <tr>
                      <th>id</th>
                      <th className="text-right">weight</th>
                      <th className="text-right">fit</th>
                      <th className="text-right">rel %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.components.map((c) => (
                      <tr key={c.id} className="border-t border-night-800">
                        <td>{c.id}</td>
                        <td className="text-right">{c.weight.toFixed(2)}</td>
                        <td className="text-right">{c.fit.toFixed(3)}</td>
                        <td className={`text-right ${c.rel >= 0 ? 'text-green-400' : 'text-red-400'}`}>{pct(c.rel)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div>
                <h3 className="text-ash-400">All allowed races</h3>
                {rankRaces(ctx.builds.get(detail.buildId)!, buildProfile(answers, ctx), ctx).map((race) => (
                  <div key={race.raceId} className="mb-2 border-t border-night-800 pt-1">
                    <div>
                      <strong>{raceName(race.raceId)}</strong> {race.score.toFixed(2)}
                      {race.newInForever && <span className="ml-1 text-gold-400">★ new</span>}
                      {race.needsPack && <span className="ml-1 text-gold-300">needs Skyborne pack</span>}
                    </div>
                    <div className="text-ash-400">
                      {race.contributions
                        .filter((c) => Math.abs(c.value) >= 0.05)
                        .map((c) => `${c.name} ${c.value.toFixed(2)}`)
                        .join(' · ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-4 xl:grid-cols-2">
            <div className={card}>
              <h2 className="mb-2 font-semibold">Why not…?</h2>
              <ul className="list-disc pl-5">
                {result.whyNot.map((w) => (
                  <li key={w.buildId}>
                    <strong>{buildName(w.buildId)}</strong> {w.rank ? `#${w.rank} ${w.match}%` : '(excluded)'}: {t(w.reason)}
                  </li>
                ))}
              </ul>
              <h2 className="mt-3 mb-1 font-semibold">Excluded</h2>
              <p className="text-ash-400">
                {result.excluded.map((e) => `${buildName(e.buildId)} (${e.reason})`).join(', ') || '—'}
              </p>
            </div>
            <div className={card}>
              <h2 className="mb-2 font-semibold">Profile</h2>
              <table className="w-full">
                <tbody>
                  {AXIS_IDS.filter((a) => result.profile.axes[a].weight > 0).map((a) => (
                    <tr key={a} className="border-t border-night-800">
                      <td>{a}</td>
                      <td className="text-right">→ {result.profile.axes[a].target.toFixed(2)}</td>
                      <td className="text-right text-ash-400">w {result.profile.axes[a].weight.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <pre className="mt-2 whitespace-pre-wrap text-xs text-ash-400">
                {JSON.stringify(
                  {
                    tags: result.profile.tags,
                    tagWeight: +result.profile.tagWeight.toFixed(2),
                    roles: result.profile.roles,
                    roleFlex: result.profile.roleFlex,
                    filters: result.profile.filters,
                    flags: result.profile.flags,
                    aesthetic: result.profile.aesthetic,
                    novelty: result.profile.novelty,
                    priorities: result.profile.priorities,
                    turnedDown: result.profile.turnedDown,
                    race: result.profile.race,
                    skippedClasses: result.profile.skippedClasses,
                  },
                  null,
                  1,
                )}
              </pre>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
