'use client';

import { useRouter } from 'next/navigation';

interface BrowseFiltersProps {
  games: { id: string; slug: string; name: string }[];
  selectedGame: string;
  selectedPeriod: string;
}

export function BrowseFilters({ games, selectedGame, selectedPeriod }: BrowseFiltersProps) {
  const router = useRouter();

  const handleGameChange = (game: string) => {
    const params = new URLSearchParams();
    params.set('game', game);
    params.set('period', selectedPeriod);
    router.push(`/browse?${params.toString()}`);
  };

  const handlePeriodChange = (period: string) => {
    const params = new URLSearchParams();
    params.set('game', selectedGame);
    params.set('period', period);
    router.push(`/browse?${params.toString()}`);
  };

  return (
    <div className="flex gap-4 mb-8">
      <div className="flex gap-2 items-center">
        <label className="text-sm font-medium">Game:</label>
        <select
          name="game"
          className="bg-slate-800 text-white px-3 py-1 rounded border border-slate-600"
          value={selectedGame}
          onChange={(e) => handleGameChange(e.target.value)}
        >
          {games.map((g) => (
            <option key={g.id} value={g.slug}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 items-center">
        <label className="text-sm font-medium">Period:</label>
        <select
          name="period"
          className="bg-slate-800 text-white px-3 py-1 rounded border border-slate-600"
          value={selectedPeriod}
          onChange={(e) => handlePeriodChange(e.target.value)}
        >
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="all">All Time</option>
        </select>
      </div>
    </div>
  );
}
