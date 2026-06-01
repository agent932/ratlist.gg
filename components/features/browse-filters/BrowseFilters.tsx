'use client';

import { useRouter } from 'next/navigation';

const TIERS = ['F', 'D', 'C', 'B', 'A', 'S'] as const;

const tierChipColors: Record<string, string> = {
  S: 'border-green-500/40 text-green-400 hover:bg-green-500/10',
  A: 'border-blue-500/40 text-blue-400 hover:bg-blue-500/10',
  B: 'border-slate-500/40 text-slate-400 hover:bg-slate-500/10',
  C: 'border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10',
  D: 'border-orange-500/40 text-orange-400 hover:bg-orange-500/10',
  F: 'border-red-500/40 text-red-400 hover:bg-red-500/10',
};

const tierChipActiveColors: Record<string, string> = {
  S: 'bg-green-500/20 border-green-500/60 text-green-300',
  A: 'bg-blue-500/20 border-blue-500/60 text-blue-300',
  B: 'bg-slate-500/20 border-slate-500/60 text-slate-300',
  C: 'bg-yellow-500/20 border-yellow-500/60 text-yellow-300',
  D: 'bg-orange-500/20 border-orange-500/60 text-orange-300',
  F: 'bg-red-500/20 border-red-500/60 text-red-300',
};

interface BrowseFiltersProps {
  games: { id: string; slug: string; name: string }[];
  selectedGame: string;
  selectedPeriod: string;
  selectedTier?: string;
}

export function BrowseFilters({ games, selectedGame, selectedPeriod, selectedTier }: BrowseFiltersProps) {
  const router = useRouter();

  const push = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const vals = { game: selectedGame, period: selectedPeriod, tier: selectedTier, ...overrides };
    for (const [k, v] of Object.entries(vals)) {
      if (v) params.set(k, v);
    }
    router.push(`/browse?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div className="flex gap-2 items-center">
          <label className="text-sm font-medium text-white/70">Game:</label>
          <select
            name="game"
            className="bg-slate-800 text-white px-3 py-1.5 rounded-lg border border-slate-600 text-sm focus:outline-none focus:border-brand"
            value={selectedGame}
            onChange={(e) => push({ game: e.target.value })}
          >
            {games.map((g) => (
              <option key={g.id} value={g.slug}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 items-center">
          <label className="text-sm font-medium text-white/70">Period:</label>
          <select
            name="period"
            className="bg-slate-800 text-white px-3 py-1.5 rounded-lg border border-slate-600 text-sm focus:outline-none focus:border-brand"
            value={selectedPeriod}
            onChange={(e) => push({ period: e.target.value })}
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-white/70 mr-1">Tier:</span>
        <button
          onClick={() => push({ tier: undefined })}
          className={`px-3 py-1 rounded-full border text-xs font-semibold transition-colors ${
            !selectedTier
              ? 'bg-brand/20 border-brand/60 text-brand'
              : 'border-white/20 text-white/50 hover:bg-white/5'
          }`}
        >
          All
        </button>
        {TIERS.map((t) => (
          <button
            key={t}
            onClick={() => push({ tier: selectedTier === t ? undefined : t })}
            className={`px-3 py-1 rounded-full border text-xs font-bold transition-colors ${
              selectedTier === t
                ? tierChipActiveColors[t]
                : `border-white/10 ${tierChipColors[t]}`
            }`}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
