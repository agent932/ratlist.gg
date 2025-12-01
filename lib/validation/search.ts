import { z } from 'zod'

export const PlayerSearchInput = z.object({
  game: z.string().min(1),
  q: z.string().min(1).max(64),
})

export type PlayerSearchInputType = z.infer<typeof PlayerSearchInput>
