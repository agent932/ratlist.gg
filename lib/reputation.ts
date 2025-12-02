/**
 * Mapping of incident category names to their reputation weight values.
 * Negative weights decrease reputation, positive weights increase it.
 */
export type CategoryWeights = Record<string, number>

/**
 * Default reputation weights for incident categories.
 * Negative values are assigned to negative behaviors (griefing, camping, etc.)
 * Positive values are assigned to positive behaviors (clutch saves, etc.)
 */
export const DEFAULT_WEIGHTS: CategoryWeights = {
  betrayal: -5,
  'extract-camping': -3,
  'stream-sniping': -4,
  'team-violation': -3,
  'clutch-save': 3,
}

/**
 * Calculate total reputation score from incident category counts.
 * 
 * @param counts - Object mapping category names to their occurrence counts
 * @param weights - Category weight multipliers (defaults to DEFAULT_WEIGHTS)
 * @returns The calculated reputation score
 * 
 * @example
 * scoreFromCounts({ 'betrayal': 2, 'clutch-save': 1 }) // -10 + 3 = -7
 */
export function scoreFromCounts(counts: Record<string, number>, weights = DEFAULT_WEIGHTS) {
  let score = 0
  for (const [k, n] of Object.entries(counts)) {
    score += (weights[k] ?? 0) * n
  }
  return score
}

/**
 * Convert numeric reputation score to letter tier rating.
 * 
 * @param score - The reputation score to convert
 * @returns Letter tier from 'F' (worst) to 'S' (best)
 * 
 * Tier Ranges:
 * - F: score <= -20 (extremely toxic)
 * - D: -20 < score <= -10 (very negative)
 * - C: -10 < score <= -3 (negative)
 * - B: -3 < score < 3 (neutral)
 * - A: 3 <= score < 10 (positive)
 * - S: score >= 10 (exemplary)
 */
export function tierFromScore(score: number) {
  if (score <= -20) return 'F'
  if (score <= -10) return 'D'
  if (score <= -3) return 'C'
  if (score < 3) return 'B'
  if (score < 10) return 'A'
  return 'S'
}
