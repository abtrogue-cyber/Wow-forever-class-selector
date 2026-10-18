import { en } from '../i18n/en'

// Placeholder until Phase 2 (cinematic landing).
export function LandingPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-4 px-4">
      <h1 className="text-4xl font-semibold text-gold-400">{en.appName}</h1>
      <p className="text-lg">{en.tagline}</p>
      <p className="text-ash-400">{en.landing.comingSoon}</p>
      <footer className="mt-12 text-xs text-ash-400">{en.disclaimer}</footer>
    </main>
  )
}
