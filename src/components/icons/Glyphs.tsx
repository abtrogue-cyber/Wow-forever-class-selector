// Our own simple line glyphs (no game icons). 24×24, drawn with currentColor.
import type { ClassId, Role } from '../../data/schemas'

const CLASS_PATHS: Record<ClassId, string> = {
  // crossed swords
  warrior: 'M4 4l10 10M14 14l2 2M6.5 15.5l-2 2M4 20l2-2M20 4L10 14M10 14l-2 2M17.5 15.5l2 2M20 20l-2-2M4 4h3M4 4v3M20 4h-3M20 4v3',
  // hammer with a ray
  paladin: 'M7 4h10v5H7zM12 9v11M9 20h6M12 1.5v1M4 6.5h1M19 6.5h1',
  // bow and arrow
  hunter: 'M6 3c7 3 7 15 0 18M6 3v18M3 12h16M16 9l3 3-3 3',
  // dagger
  rogue: 'M12 2l2.5 10h-5zM8 12h8M12 12v5M10.5 17h3M12 20v1.5',
  // halo star
  priest: 'M12 3v4M12 17v4M3 12h4M17 12h4M12 8a4 4 0 1 1 0 8a4 4 0 1 1 0-8',
  // totem bolt
  shaman: 'M13 2L6 13h5l-1 9 8-12h-5z',
  // arcane star
  mage: 'M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2zM12 9.5v5M9.5 12h5',
  // fel eye with horns
  warlock: 'M3 12c3-5 15-5 18 0c-3 5-15 5-18 0zM12 10a2 2 0 1 1 0 4a2 2 0 1 1 0-4M6 7L4 3M18 7l2-4',
  // leaf
  druid: 'M5 19C5 9 11 4 20 4c0 9-5 15-15 15zM5 19l9-9',
}

const ROLE_PATHS: Record<Role, string> = {
  tank: 'M12 3l7 3v5c0 5-3 8-7 10c-4-2-7-5-7-10V6z',
  healer: 'M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z',
  dps: 'M18 3h3v3L9 18l-3-3zM5 16l3 3M3 21l3-3',
}

type GlyphProps = { className?: string; title?: string }

function Glyph({ d, className, title }: GlyphProps & { d: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      <path d={d} />
    </svg>
  )
}

export const ClassGlyph = ({ classId, ...p }: GlyphProps & { classId: ClassId }) => <Glyph d={CLASS_PATHS[classId]} {...p} />
export const RoleGlyph = ({ role, ...p }: GlyphProps & { role: Role }) => <Glyph d={ROLE_PATHS[role]} {...p} />
