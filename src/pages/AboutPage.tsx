import { gameData } from '../data'
import { Page } from '../components/layout/Site'
import { en } from '../i18n/en'

export function AboutPage() {
  const { meta } = gameData
  const sources = gameData.sources.filter((s) => s.kind !== 'editorial')
  return (
    <Page>
      <article className="mx-auto flex max-w-2xl flex-col gap-6 py-8">
        <h1 className="text-3xl sm:text-4xl">{en.about.title}</h1>
        <p className="text-lg text-parchment-100">{en.about.intro}</p>

        <section>
          <h2 className="mb-2 text-xl">{en.about.howTitle}</h2>
          <ol className="list-decimal space-y-1.5 pl-5 text-ash-300">
            {en.about.how.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="mb-2 text-xl">{en.about.honestyTitle}</h2>
          <ul className="list-disc space-y-1.5 pl-5 text-ash-300">
            {en.about.honesty.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-ash-400">{en.about.dataState(meta.gameState, meta.lastVerified, meta.dataVersion)}</p>
        </section>

        <section>
          <h2 className="mb-2 text-xl">{en.about.sourcesTitle}</h2>
          <ul className="space-y-1 text-sm">
            {sources.map((s) => (
              <li key={s.id}>
                <a href={s.url} target="_blank" rel="noreferrer noopener" className="text-gold-300 underline-offset-4 hover:underline">
                  {s.title}
                </a>{' '}
                <span className="text-ash-400">
                  · {s.publisher}
                  {s.published ? ` · ${s.published}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-xl">{en.about.legalTitle}</h2>
          <p className="text-ash-300">{en.disclaimer}</p>
          <p className="mt-2 text-ash-300">{en.iconsCredit}</p>
        </section>
      </article>
    </Page>
  )
}
