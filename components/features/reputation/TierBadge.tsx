'use client'

import { TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

const TIER_META: Record<string, { label: string; range: string; color: string }> = {
  S: { label: 'Exemplary',      range: 'Score ≥ 10',       color: 'text-green-400' },
  A: { label: 'Positive',       range: 'Score 3 – 9',      color: 'text-blue-400'  },
  B: { label: 'Neutral',        range: 'Score −2 – 2',     color: 'text-slate-400' },
  C: { label: 'Negative',       range: 'Score −3 – −9',    color: 'text-yellow-400'},
  D: { label: 'Very Negative',  range: 'Score −10 – −19',  color: 'text-orange-400'},
  F: { label: 'Extremely Toxic','range': 'Score ≤ −20',    color: 'text-red-400'   },
}

interface TierBadgeProps {
  tier: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'text-sm font-bold',
  md: 'text-xl font-bold',
  lg: 'text-4xl font-bold',
}

export function TierBadge({ tier, size = 'md' }: TierBadgeProps) {
  const meta = TIER_META[tier] ?? { label: 'Unknown', range: '', color: 'text-slate-400' }

  return (
    <TooltipProvider delayDuration={200}>
      <TooltipRoot>
        <TooltipTrigger asChild>
          <span className={`${sizeClasses[size]} ${meta.color} cursor-default`}>{tier}</span>
        </TooltipTrigger>
        <TooltipContent side="top">
          <div className="space-y-0.5">
            <div className={`font-semibold ${meta.color}`}>Tier {tier} — {meta.label}</div>
            <div className="text-white/50">{meta.range}</div>
          </div>
        </TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  )
}
