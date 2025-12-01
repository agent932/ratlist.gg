/**
 * Centralized color mappings for consistent styling across the application
 */

export const SEVERITY_COLORS = {
  low: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  medium: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  high: 'bg-red-500/10 text-red-500 border-red-500/20',
} as const;

export const STATUS_COLORS = {
  active: 'bg-green-500/10 text-green-500 border-green-500/20',
  removed: 'bg-red-500/10 text-red-500 border-red-500/20',
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
} as const;

export const RESOLUTION_COLORS = {
  open: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  approved: 'bg-green-500/10 text-green-500 border-green-500/20',
  dismissed: 'bg-red-500/10 text-red-500 border-red-500/20',
} as const;

export const CATEGORY_COLORS = {
  Betrayal: 'bg-red-500/10 text-red-400 border-red-500/20',
  Toxicity: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Scamming: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Teaming: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Cheating: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  Positive: 'bg-green-500/10 text-green-400 border-green-500/20',
} as const;
