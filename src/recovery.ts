// After a deploy, a tab that was opened earlier still runs the old app, which asks for code files that no
// longer exist. Reloading once picks up the new version. The guard stops a reload loop if a file is really
// missing; then the error boundary shows a friendly message instead.

const KEY = 'fm-reloaded-at'
const GUARD_MS = 10_000

/** Reloads the page unless it was just reloaded for this reason. Returns whether it reloads. */
export function reloadOnceForNewVersion(reload: () => void = () => window.location.reload()): boolean {
  try {
    const last = Number(window.sessionStorage.getItem(KEY) ?? 0)
    if (Date.now() - last < GUARD_MS) return false
    window.sessionStorage.setItem(KEY, String(Date.now()))
  } catch {
    // Without storage there's no loop guard, so don't reload automatically; the error screen offers a button.
    return false
  }
  reload()
  return true
}

/** Errors browsers throw when a lazily loaded code file can't be fetched or parsed. */
export function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  return /dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS/i.test(message)
}
