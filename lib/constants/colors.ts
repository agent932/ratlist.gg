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

// Badge colors for category labels (used in incident lists)
export const CATEGORY_COLORS = {
  Betrayal: 'bg-red-500/10 text-red-400 border-red-500/20',
  Toxicity: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Scamming: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Teaming: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Cheating: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  Griefing: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Stream Sniping': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'Extract Camping': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'Team Violation': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Friendly Fire': 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20',
  'Clutch Save': 'bg-green-500/10 text-green-400 border-green-500/20',
  Helpful: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Positive: 'bg-green-500/10 text-green-400 border-green-500/20',
} as const;

// Left-border accent color for incident cards (by category slug)
export const CATEGORY_ACCENT: Record<string, string> = {
  cheating: 'border-l-rose-500',
  scamming: 'border-l-amber-500',
  betrayal: 'border-l-red-500',
  griefing: 'border-l-orange-500',
  'stream-sniping': 'border-l-yellow-500',
  'extract-camping': 'border-l-yellow-400',
  'team-violation': 'border-l-amber-400',
  toxicity: 'border-l-orange-400',
  teaming: 'border-l-purple-500',
  'friendly-fire': 'border-l-yellow-300',
  'clutch-save': 'border-l-green-500',
  helpful: 'border-l-emerald-500',
};
