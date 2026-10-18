import { useState } from 'react'
import type { Wording } from '../../data'
import type { BuildResult } from '../../engine/types'
import { en } from '../../i18n/en'
import { buildInfo, ctx } from './shared'

export function SharePanel({ results, wording: w }: { results: BuildResult[]; wording: keyof Wording }) {
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)
  const url = window.location.href
  const first = results[0]
  if (!first) return null
  const top = buildInfo(first.buildId)
  const text = en.result.shareText(top.build.name, first.match)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // Older browsers / blocked clipboard: select the field so the user can copy by hand.
      const field = document.getElementById('share-url') as HTMLInputElement | null
      field?.select()
      return
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  const saveImage = async () => {
    setSaving(true)
    try {
      const { renderResultCard, downloadBlob } = await import('./resultImage')
      const race = first.races[0]
      const blob = await renderResultCard({
        heading: en.result.title,
        build: top.build.name,
        className: top.cls.name,
        classId: top.cls.id,
        color: top.cls.colorHex,
        race: race ? (ctx.races.get(race.raceId)?.name ?? null) : null,
        raceNote: race?.newInForever ? en.result.newCombo : null,
        match: first.match,
        matchLabel: en.result.match,
        reasons: first.reasons.map((r) => r.text[w]),
        alsoLabel: en.result.moreTitle,
        runnersUp: results.slice(1, 3).map((r) => {
          const info = buildInfo(r.buildId)
          return { name: info.build.name, color: info.cls.colorHex, match: r.match }
        }),
        site: window.location.host,
        disclaimer: en.result.imageDisclaimer,
      })
      const filename = `forever-main-${top.build.id}.png`
      const file = new File([blob], filename, { type: 'image/png' })
      // Phones: hand the image to the share sheet (Discord, Messages…). Desktop: download it.
      const touch = window.matchMedia('(pointer: coarse)').matches
      if (touch && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: en.appName, text: `${text} ${url}` }).catch(() => {})
      } else {
        downloadBlob(blob, filename)
      }
    } finally {
      setSaving(false)
    }
  }

  const canShare = typeof navigator.share === 'function'

  return (
    <section className="panel p-5" aria-labelledby="share-title">
      <h2 id="share-title" className="text-xl">
        {en.result.shareTitle}
      </h2>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          id="share-url"
          readOnly
          value={url}
          aria-label={en.result.shareTitle}
          onFocus={(e) => e.currentTarget.select()}
          className="min-w-0 flex-1 rounded-full border border-night-600 bg-night-800 px-4 py-2.5 text-sm text-ash-300"
        />
        <button type="button" className="btn-primary" onClick={copy}>
          {copied ? en.result.copied : en.result.copyLink}
        </button>
        {canShare && (
          <button type="button" className="btn-ghost" onClick={() => navigator.share({ title: en.appName, text, url }).catch(() => {})}>
            {en.result.share}
          </button>
        )}
        <button type="button" className="btn-ghost" onClick={saveImage} disabled={saving} aria-busy={saving}>
          {saving ? en.result.savingImage : en.result.saveImage}
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {copied ? en.result.copied : ''}
      </p>
    </section>
  )
}
