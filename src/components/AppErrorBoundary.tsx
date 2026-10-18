import { Component, type ErrorInfo, type ReactNode } from 'react'
import { en } from '../i18n/en'
import { isChunkLoadError, reloadOnceForNewVersion } from '../recovery'

type State = { error: unknown }

/** Last line of defense: a friendly message with a reload button instead of a blank page. */
export class AppErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: unknown): State {
    return { error }
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    // A file from an older deploy: reloading once usually fixes it (see recovery.ts).
    if (isChunkLoadError(error) && reloadOnceForNewVersion()) return
    console.error(error, info.componentStack)
  }

  render() {
    if (this.state.error == null) return this.props.children
    return (
      <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-start justify-center gap-4 px-4">
        <h1 className="text-3xl">{en.error.title}</h1>
        <p className="text-ash-300">{en.error.body}</p>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn-primary" onClick={() => window.location.reload()}>
            {en.error.reload}
          </button>
          <a href="/" className="btn-ghost">
            {en.notFound.home}
          </a>
        </div>
      </main>
    )
  }
}
