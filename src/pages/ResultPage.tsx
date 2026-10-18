import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { Link, useLocation } from 'wouter'
import { gameData, type AxisId } from '../data'
import { ClassGlyph } from '../components/icons/Glyphs'
import { Page } from '../components/layout/Site'
import { ResultCard } from '../components/results/ResultCard'
import { RevealCard } from '../components/results/RevealCard'
import { SharePanel } from '../components/results/SharePanel'
import { TweakPanel } from '../components/results/TweakPanel'
import { buildInfo, ctx, MatchBadge, radarAxes } from '../components/results/shared'
import { ENGINE_VERSION } from '../engine/config'
import { buildProfile } from '../engine/profile'
import { rank } from '../engine/rank'
import type { Answers, TweakLevel } from '../engine/types'
import { en } from '../i18n/en'
import { decodeShareCode, encodeShareCode, isOutdated, type DecodedShare } from '../share/codec'
import { useQuizStore, wordingFor } from '../state/quizStore'

const versions = { engineVersion: ENGINE_VERSION, dataVersion: gameData.meta.dataVersion }
const TOP = 3
const MORE = 10

const storage = {
  get: (k: string) => {
    try {
      return window.sessionStorage.getItem(k)
    } catch {
      return null
    }
  },
  set: (k: string) => {
    try {
      window.sessionStorage.setItem(k, '1')
    } catch {
      /* private mode: the reveal just plays again next time */
    }
  },
}

export function ResultPage({ params }: { params: { code: string } }) {
  const decoded = useMemo(() => {
    try {
      return decodeShareCode(decodeURIComponent(params.code))
    } catch {
      return null
    }
  }, [params.code])

  if (!decoded) {
    return (
      <Page>
        <div className="mx-auto flex max-w-xl flex-col items-start gap-4 py-16">
          <h1 className="text-3xl">{en.notFound.title}</h1>
          <p>{en.result.invalid}</p>
          <Link href="/" className="btn-primary">
            {en.result.takeQuiz}
          </Link>
        </div>
      </Page>
    )
  }
  return <ResultView decoded={decoded} />
}

function ResultView({ decoded }: { decoded: DecodedShare }) {
  const [, navigate] = useLocation()
  const { answers } = decoded
  const w = wordingFor(answers.setup)
  const result = useMemo(() => rank(answers, gameData), [answers])

  // Tweakable axes come from the untweaked profile, so the slider list doesn't jump around.
  const untweaked: Answers = useMemo(() => ({ setup: answers.setup, picks: answers.picks }), [answers])
  const tweakAxes = useMemo(() => radarAxes(buildProfile(untweaked, ctx), 4).slice(0, 4), [untweaked])
  const revealKey = `fm-revealed:${encodeShareCode(untweaked, versions)}`
  const [showReveal, setShowReveal] = useState(() => storage.get(revealKey) === null)
  const [showAll, setShowAll] = useState(false)

  const retake = () => {
    useQuizStore.getState().reset()
    navigate('/quiz')
  }
  const closeReveal = () => {
    storage.set(revealKey)
    setShowReveal(false)
  }
  const setTweaks = (tweaks: Partial<Record<AxisId, TweakLevel>>) =>
    navigate(`/result/${encodeShareCode({ ...answers, tweaks }, versions)}`, { replace: true })
  const setTweak = (axis: AxisId, level: TweakLevel) => {
    const tweaks = { ...answers.tweaks, [axis]: level }
    if (level === 4) delete tweaks[axis]
    setTweaks(tweaks)
  }

  const top = result.results.slice(0, TOP)
  const rest = result.results.slice(TOP, showAll ? undefined : MORE)
  const first = result.results[0]
  const firstInfo = first ? buildInfo(first.buildId) : undefined
  const setupLabel = (field: 'faction' | 'ruleset') =>
    gameData.questions.setup.find((s) => s.id === field)?.options.find((o) => o.id === answers.setup[field])?.label[w]

  return (
    <Page
      headerRight={
        <button type="button" className="hover:text-parchment-100" onClick={retake}>
          {en.nav.retake}
        </button>
      }
    >
      <AnimatePresence>{showReveal && first && <RevealCard result={first} wording={w} onClose={closeReveal} />}</AnimatePresence>

      <div className="flex flex-col gap-6 py-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl sm:text-4xl">{en.result.title}</h1>
          <p className="flex flex-wrap gap-2 text-sm text-ash-300">
            <span className="rounded-full border border-night-600 px-3 py-0.5">
              {answers.setup.faction === 'any' ? en.result.setupSummary.any : setupLabel('faction')}
            </span>
            <span className="rounded-full border border-night-600 px-3 py-0.5">{setupLabel('ruleset')}</span>
          </p>
          {isOutdated(decoded, versions) && <p className="text-sm text-gold-300">{en.result.outdated}</p>}
          {result.notes.map((n) => (
            <p key={n.newcomer} className="text-gold-300">
              {n[w]}
            </p>
          ))}
        </header>

        <LayoutGroup>
          <ol className="flex flex-col gap-5">
            {top.map((r, i) => (
              <motion.li key={r.buildId} layout transition={{ type: 'spring', stiffness: 260, damping: 30 }}>
                <ResultCard result={r} profile={result.profile} wording={w} featured={i === 0} />
              </motion.li>
            ))}
          </ol>

          {rest.length > 0 && (
            <section aria-labelledby="more-title" className="flex flex-col gap-3">
              <h2 id="more-title" className="text-xl">
                {en.result.moreTitle}
              </h2>
              <ol className="flex flex-col gap-2">
                {rest.map((r) => {
                  const { build, cls } = buildInfo(r.buildId)
                  const race = r.races[0]
                  return (
                    <motion.li
                      key={r.buildId}
                      layout
                      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
                      className="panel flex items-center gap-3 px-4 py-3"
                    >
                      <span className="w-6 text-right font-display text-sm text-ash-400">{r.rank}</span>
                      <ClassGlyph classId={cls.id} className="size-6 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold" style={{ color: cls.colorHex }}>
                          {build.name}
                        </p>
                        <p className="truncate text-sm text-ash-400">
                          {race ? ctx.races.get(race.raceId)?.name : ''}
                          {race?.newInForever ? ' ★' : ''} · {r.reasons[0]?.text[w]}
                        </p>
                      </div>
                      <MatchBadge match={r.match} color={cls.colorHex} size="sm" />
                    </motion.li>
                  )
                })}
              </ol>
              {result.results.length > MORE && (
                <button type="button" className="btn-ghost self-start" onClick={() => setShowAll((v) => !v)}>
                  {showAll ? en.result.showLess : en.result.showAll(result.results.length)}
                </button>
              )}
            </section>
          )}
        </LayoutGroup>

        <div className="grid gap-5 md:grid-cols-2">
          <section className="panel p-5" aria-labelledby="whynot-title">
            <h2 id="whynot-title" className="text-xl">
              {en.result.whyNotTitle}
            </h2>
            <ul className="mt-3 flex flex-col gap-3">
              {result.whyNot.map((x) => {
                const { build, cls } = buildInfo(x.buildId)
                return (
                  <li key={x.buildId}>
                    <p className="font-semibold" style={{ color: cls.colorHex }}>
                      {build.name}{' '}
                      <span className="text-sm font-normal text-ash-400">
                        {x.rank ? `#${x.rank} · ${x.match}%` : en.result.excluded}
                      </span>
                    </p>
                    <p className="text-ash-300">{x.reason[w]}</p>
                  </li>
                )
              })}
            </ul>
          </section>
          <TweakPanel axes={tweakAxes} tweaks={answers.tweaks ?? {}} onChange={setTweak} onReset={() => setTweaks({})} />
        </div>

        {first && firstInfo && <SharePanel buildName={firstInfo.build.name} match={first.match} />}

        <p className="text-sm text-ash-400">{en.result.betaNote}</p>
        <div>
          <button type="button" className="btn-ghost" onClick={retake}>
            {en.nav.retake}
          </button>
        </div>
      </div>
    </Page>
  )
}
