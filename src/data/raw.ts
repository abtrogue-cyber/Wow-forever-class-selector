import sources from './sources.json'
import meta from './meta.json'
import axes from './axes.json'
import tags from './tags.json'
import classes from './classes.json'
import builds from './builds.json'
import races from './races.json'
import raceClass from './raceClass.json'
import questions from './questions.json'
import explanations from './explanations.json'

/** The JSON exactly as authored. Use `parseGameData` (or `gameData` in the app) to get validated, typed data. */
export const rawData = { sources, meta, axes, tags, classes, builds, races, raceClass, questions, explanations }
