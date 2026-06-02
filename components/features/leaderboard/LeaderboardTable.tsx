import { Card } from '@/components/ui/card';
import { formatPlayerName, playerProfileUrl } from '@/lib/utils/player';
import { tierFromScore } from '@/lib/reputation';
import { TierBadge } from '@/components/features/reputation/TierBadge';

interface LeaderboardEntry {
  player_id: string;
  identifier: string;
  display_name: string | null;
  report_count: number;
  score: number;
  game_slug?: string;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  gameSlug?: string;
}

const rankStyles: Record<number, { row: string; rank: string; medal: string }> = {
  0: { row: 'bg-amber-500/5 border-amber-500/20',  rank: 'text-amber-400 font-bold', medal: '🥇' },
  1: { row: 'bg-slate-400/5 border-slate-400/20',  rank: 'text-slate-300 font-bold', medal: '🥈' },
  2: { row: 'bg-amber-700/5 border-amber-700/20',  rank: 'text-amber-600 font-bold', medal: '🥉' },
}

export function LeaderboardTable({ entries, gameSlug }: LeaderboardTableProps) {
  if (!entries || entries.length === 0) {
    return (
      <Card className="p-8 text-center border-white/10 bg-white/5">
        <p className="text-white/40">No players reported in this period</p>
      </Card>
    );
  }

  return (
    <div className="space-y-1.5">
      {/* Header */}
      <div className="grid grid-cols-[3rem_1fr_4rem_5rem_5rem] gap-2 px-4 pb-1 text-xs font-medium text-white/30 uppercase tracking-wider">
        <span>#</span>
        <span>Player</span>
        <span className="text-center">Tier</span>
        <span className="text-right">Reports</span>
        <span className="text-right">Score</span>
      </div>

      {entries.map((entry, idx) => {
        const tier = tierFromScore(entry.score)
        const slug = entry.game_slug || gameSlug
        const profileHref = slug ? playerProfileUrl(slug, entry.identifier) : undefined
        const style = rankStyles[idx]
        const isTop3 = idx < 3

        return (
          <div
            key={entry.player_id}
            className={`grid grid-cols-[3rem_1fr_4rem_5rem_5rem] gap-2 items-center px-4 py-3 rounded-lg border transition-colors ${
              isTop3
                ? `${style.row} hover:brightness-110`
                : 'border-white/5 bg-white/3 hover:bg-white/5'
            }`}
          >
            {/* Rank */}
            <span className={`text-sm ${isTop3 ? style.rank : 'text-white/30'}`}>
              {isTop3 ? style.medal : idx + 1}
            </span>

            {/* Player */}
            <span className="font-medium text-sm truncate">
              {profileHref ? (
                <a href={profileHref} className={`hover:text-brand transition-colors ${isTop3 ? 'text-white' : 'text-white/80'}`}>
                  {formatPlayerName(entry.display_name || entry.identifier)}
                </a>
              ) : (
                <span className={isTop3 ? 'text-white' : 'text-white/80'}>
                  {formatPlayerName(entry.display_name || entry.identifier)}
                </span>
              )}
            </span>

            {/* Tier */}
            <span className="text-center">
              <TierBadge tier={tier} size="sm" />
            </span>

            {/* Reports */}
            <span className="text-right text-sm text-white/60">{entry.report_count}</span>

            {/* Score */}
            <span className={`text-right text-sm font-semibold ${entry.score < 0 ? 'text-red-400' : 'text-green-400'}`}>
              {entry.score}
            </span>
          </div>
        )
      })}
    </div>
  );
}
