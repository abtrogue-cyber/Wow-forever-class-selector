/**
 * The gold check on a picked answer, so a pick doesn't rest on the border color alone. Always rendered and shown
 * by CSS once its tile or chip is picked (`.pick-mark`), so it can fade in; where it sits is up to the caller.
 */
export function PickMark({ className = '' }: { className?: string }) {
  return (
    <span className={`pick-mark ${className}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </span>
  )
}
