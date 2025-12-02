/**
 * Zod validation schemas for search-related inputs.
 */

import { z } from 'zod'

/**
 * Validation schema for player search requests.
 * 
 * @property game - Game slug/identifier (required, min 1 character)
 * @property q - Search query string (1-64 characters)
 */
export const PlayerSearchInput = z.object({
  game: z.string().min(1),
  q: z.string().min(1).max(64),
})

export type PlayerSearchInputType = z.infer<typeof PlayerSearchInput>
