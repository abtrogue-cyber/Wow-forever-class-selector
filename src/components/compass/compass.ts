import { gameData, type AxisId } from '../../data'
import { getContext } from '../../engine/context'
import { buildProfile } from '../../engine/profile'
import type { Answers, Setup } from '../../engine/types'
import { buildGalaxy, playerAxes, topAxes, type Vec3 } from '../../galaxy/pca'
import { en } from '../../i18n/en'

// The quiz compass: the Spec Galaxy's three directions, without the spec stars, and your star moving
// through them as you answer. Pure functions; the 3D scene and the 2D map only draw what this returns.

const ctx = getContext(gameData)
export const galaxy = buildGalaxy(gameData.builds)

export type CompassStar = { id: string; color: string; pos: Vec3 }

/** The 28 spec stars, revealed at the end of the quiz (and shown faintly on the landing page). */
export const STARS: CompassStar[] = gameData.builds.map((b) => ({
  id: b.id,
  color: ctx.classes.get(b.classId)!.colorHex,
  pos: galaxy.stars.get(b.id)!,
}))

export const DEFAULT_TINT = '#3b4f9a'
export const DEFAULT_ORB = '#f5c86b'

/** The place you'd love to live tints the sky. Keys are `home` option ids. */
export const HOME_TINT: Record<string, string> = {
  'stone-city': '#5878e8', // royal banners
  'mountain-hall': '#e0603a', // roaring hearth
  workshop: '#33c3b4', // humming machines
  'moon-forest': '#9a7cf2', // silver moonlight
  'open-plains': '#e2a64a', // fire under the stars
  'misty-ruins': '#4fb38a', // whispering mist
  'sky-island': '#8fd3ff', // open sky
}

/** The feeling you want more of colors your star. Keys are `feeling` option ids. */
export const FEELING_COLOR: Record<string, string> = {
  calm: '#a8d8ff',
  'close-call': '#ff7a45',
  wonder: '#c9a2ff',
  'counted-on': '#ffd36b',
  edge: '#ff5c9a',
  freedom: '#7ee0a1',
}

/** Question and option ids the compass reacts to beyond the axes (checked by tests against the data). */
export const LOOK_IDS = {
  home: 'home',
  feeling: 'feeling',
  novelty: { question: 'restaurant', option: 'something-new' },
  companion: { question: 'preferences', option: 'want-companion' },
} as const

type Picks = Answers['picks']

const NEUTRAL_SETUP: Setup = { experience: 'played', faction: 'any', ruleset: 'normal', skyborne: 'no' }

function fullSetup(setup: Partial<Setup>): Setup {
  const chosen = Object.fromEntries(Object.entries(setup).filter(([, v]) => v != null)) as Partial<Setup>
  return { ...NEUTRAL_SETUP, ...chosen }
}

/** Your star for these answers. A half-filled setup counts its missing fields as neutral. */
export function positionFor(setup: Partial<Setup>, picks: Picks): Vec3 {
  const profile = buildProfile({ setup: fullSetup(setup), picks }, ctx)
  return galaxy.project(playerAxes(profile, gameData.builds))
}

const answered = (pick: Picks[string]) => pick != null && !(Array.isArray(pick) && pick.length === 0)
const dist = (a: Vec3, b: Vec3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])

/**
 * Where your star stopped after each answer, in question order, starting from the setup.
 * Answers that don't move it (e.g. the place you'd love to live) don't add a stop.
 */
export function trailFor(setup: Partial<Setup>, picks: Picks): Vec3[] {
  const path: Vec3[] = [positionFor(setup, {})]
  const soFar: Picks = {}
  for (const q of gameData.questions.questions) {
    if (!answered(picks[q.id])) continue
    soFar[q.id] = picks[q.id]
    const p = positionFor(setup, soFar)
    if (dist(p, path[path.length - 1]!) > 0.01) path.push(p)
  }
  return path
}

export type CompassLook = { tint: string; orb: string; novelty: boolean; companion: boolean }

/** Everything about your star that isn't its position. */
export function lookFor(picks: Picks): CompassLook {
  const home = picks[LOOK_IDS.home]
  const feeling = picks[LOOK_IDS.feeling]
  const prefs = picks[LOOK_IDS.companion.question]
  return {
    tint: (typeof home === 'string' && HOME_TINT[home]) || DEFAULT_TINT,
    orb: (typeof feeling === 'string' && FEELING_COLOR[feeling]) || DEFAULT_ORB,
    novelty: picks[LOOK_IDS.novelty.question] === LOOK_IDS.novelty.option,
    companion: Array.isArray(prefs) && prefs.includes(LOOK_IDS.companion.option),
  }
}

const WORDS: Record<AxisId, readonly [string, string]> = en.compass.axisWords

/** Plain-words names for both ends of the three directions: [negative end, positive end]. */
export const AXIS_ENDS: [string, string][] = galaxy.components.map((component) => {
  const top = topAxes(component, 4)
  const pos = top.find((t) => t.sign > 0)
  const neg = top.find((t) => t.sign < 0)
  // An end is named after the axis that grows most toward it; if none does, after the opposite axis' low end.
  const posName = pos ? WORDS[pos.axis][1] : WORDS[neg!.axis][0]
  const negName = neg ? WORDS[neg.axis][1] : WORDS[pos!.axis][0]
  return [negName, posName]
})
