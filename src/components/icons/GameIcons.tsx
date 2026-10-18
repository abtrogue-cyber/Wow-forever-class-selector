import { useState } from 'react'
import type { Build, ClassId } from '../../data'
import icons from '../../data/icons.json'
import { ClassGlyph } from './Glyphs'

// Blizzard's own icons, shown by the owner's choice (D43): each class's Hearthstone icon and each spec's
// WoW Classic talent-tree icon. They load from Blizzard's and Wowhead's image servers (never stored here),
// without a referrer, and fall back to our own glyph if a server is unreachable or blocks the request.

const CLASS_FILES: Record<string, string> = icons.classes
const SPEC_FILES: Record<string, string> = icons.specs

export const classIconUrl = (classId: ClassId) => `${icons.classBase}${CLASS_FILES[classId]}`
export const specIconUrl = (buildId: string) => `${icons.specBase}${SPEC_FILES[buildId]}.jpg`

type Props = { className?: string }

function Remote({ src, fallback, className }: { src: string; fallback: React.ReactNode; className: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) return <>{fallback}</>
  return (
    <img
      src={src}
      alt=""
      className={className}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      draggable={false}
      onError={() => setFailed(true)}
    />
  )
}

/** The class's Hearthstone icon (round, 68 px source). */
export function ClassIcon({ classId, className = '' }: Props & { classId: ClassId }) {
  return <Remote src={classIconUrl(classId)} className={className} fallback={<ClassGlyph classId={classId} className={className} />} />
}

/** The spec's WoW Classic talent-tree icon (square, 56 px source), framed like an action-bar icon. */
export function SpecIcon({ build, className = '' }: Props & { build: Build }) {
  return (
    <Remote
      src={specIconUrl(build.id)}
      className={`rounded-md border border-black/70 shadow-[0_0_0_1px_rgb(245_200_107/0.35)] ${className}`}
      fallback={<ClassGlyph classId={build.classId} className={className} />}
    />
  )
}
