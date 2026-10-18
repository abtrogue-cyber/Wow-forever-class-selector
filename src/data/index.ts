import { rawData } from './raw'
import type { GameData } from './schemas'
import { parseGameData } from './validate'

/**
 * Validated game data for the app. Dev and tests validate on load; production trusts the JSON
 * (the test suite fails on invalid data) so Zod stays out of the user's bundle.
 */
export const gameData: GameData = import.meta.env.DEV ? parseGameData(rawData) : (rawData as unknown as GameData)

export * from './schemas'
