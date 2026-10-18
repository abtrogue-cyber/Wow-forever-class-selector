import { useState } from 'react'
import { en } from '../../i18n/en'

export function SharePanel({ buildName, match }: { buildName: string; match: number }) {
  const [copied, setCopied] = useState(false)
  const url = window.location.href
  const text = en.result.shareText(buildName, match)

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
      </div>
      <p className="sr-only" aria-live="polite">
        {copied ? en.result.copied : ''}
      </p>
    </section>
  )
}
