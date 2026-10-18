import { Link } from 'wouter'
import { en } from '../i18n/en'

export function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-4 px-4">
      <h1 className="text-3xl font-semibold text-gold-400">{en.notFound.title}</h1>
      <p>{en.notFound.body}</p>
      <Link href="/" className="text-gold-300 underline">
        {en.notFound.home}
      </Link>
    </main>
  )
}
