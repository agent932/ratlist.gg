import { z } from 'zod'

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
