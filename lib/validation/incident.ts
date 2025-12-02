/**
 * Zod validation schema for incident report submissions.
 * Enforces data shape and constraints at the API boundary.
 */

import { z } from 'zod'

/**
 * Validation schema for incident report input.
 * 
 * @property game_id - UUID of the game
 * @property identifier - Player identifier (2-64 characters)
 * @property category_id - Positive integer ID of incident category
 * @property occurred_at - Optional ISO datetime string of when incident occurred
 * @property description - Incident description (10-2000 characters)
 * @property region - Optional region/server (max 32 characters)
 * @property mode - Optional game mode (max 32 characters)
 * @property map - Optional map name (max 64 characters)
 * @property is_anonymous - Optional boolean for anonymous reporting
 */
export const IncidentInput = z.object({
  game_id: z.string().uuid(),
  identifier: z.string().min(2).max(64),
  category_id: z.number().int().positive(),
  occurred_at: z.string().datetime().optional(),
  description: z.string().min(10).max(2000),
  region: z.string().max(32).optional(),
  mode: z.string().max(32).optional(),
  map: z.string().max(64).optional(),
  is_anonymous: z.boolean().optional(),
})

export type IncidentInputType = z.infer<typeof IncidentInput>
