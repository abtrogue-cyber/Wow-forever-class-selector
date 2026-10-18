import type { ReactNode } from 'react'
import { Link } from 'wouter'
import { en } from '../../i18n/en'

export function SiteHeader({ right }: { right?: ReactNode }) {
  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 pt-4">
      <Link href="/" className="font-display text-sm font-semibold tracking-[0.2em] text-gold-400 uppercase">
        {en.nav.home}
      </Link>
      <nav className="flex items-center gap-4 text-sm text-ash-400">
        {right}
        <Link href="/about" className="hover:text-parchment-100">
          {en.nav.about}
        </Link>
      </nav>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-5xl px-4 pt-10 pb-8 text-xs leading-relaxed text-ash-400">
      <p>{en.disclaimer}</p>
    </footer>
  )
}

export function Page({ children, headerRight }: { children: ReactNode; headerRight?: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-night-800 focus:px-3 focus:py-2">
        Skip to content
      </a>
      <SiteHeader right={headerRight} />
      <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4">
        {children}
      </main>
      <SiteFooter />
    </div>
  )
}
