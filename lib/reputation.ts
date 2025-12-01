export type CategoryWeights = Record<string, number>

// Example weights: negative for griefing, positive for clutch saves
export const DEFAULT_WEIGHTS: CategoryWeights = {
  betrayal: -5,
  'extract-camping': -3,
  'stream-sniping': -4,
  'team-violation': -3,
  'clutch-save': 3,
}

export function scoreFromCounts(counts: Record<string, number>, weights = DEFAULT_WEIGHTS) {
  let score = 0
  for (const [k, n] of Object.entries(counts)) {
    score += (weights[k] ?? 0) * n
  }
  return score
}

export function tierFromScore(score: number) {
  if (score <= -20) return 'F'
  if (score <= -10) return 'D'
  if (score <= -3) return 'C'
  if (score < 3) return 'B'
  if (score < 10) return 'A'
  return 'S'
}
