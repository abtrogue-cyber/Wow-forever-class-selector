import { rawData } from './raw'
import type { GameData } from './schemas'

/**
 * Game data for the app. The JSON is validated by the test suite and, in dev, once at startup
 * (see main.tsx), so neither Zod nor the validator ends up in the production bundle.
 */
export const gameData = rawData as unknown as GameData

export * from './vocab'
export type * from './schemas'
