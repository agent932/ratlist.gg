import { Card } from '@/components/ui/card';
import { formatPlayerName } from '@/lib/utils/player';

interface LeaderboardEntry {
  player_id: string;
  identifier: string;
  display_name: string | null;
  report_count: number;
  score: number;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
}

export function LeaderboardTable({ entries }: LeaderboardTableProps) {
  if (!entries || entries.length === 0) {
    return (
      <Card className="p-6 text-center text-slate-500">No data for this period</Card>
    );
  }

  return (
    <Card className="p-4 sm:p-6 overflow-x-auto">
      <table className="w-full min-w-[500px]" role="table" aria-label="Player leaderboard">
        <thead>
          <tr className="text-left border-b border-slate-700">
            <th scope="col" className="pb-2 text-sm sm:text-base">Rank</th>
            <th scope="col" className="pb-2 text-sm sm:text-base">Player</th>
            <th scope="col" className="pb-2 text-right text-sm sm:text-base">Reports</th>
            <th scope="col" className="pb-2 text-right text-sm sm:text-base">Score</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => (
            <tr key={entry.player_id} className="border-b border-slate-800">
              <td className="py-3 text-sm sm:text-base">{idx + 1}</td>
              <td className="py-3 font-mono text-xs sm:text-sm truncate max-w-[150px] sm:max-w-none">{formatPlayerName(entry.display_name || entry.identifier)}</td>
              <td className="py-3 text-right text-sm sm:text-base">{entry.report_count}</td>
              <td
                className={`py-3 text-right font-semibold text-sm sm:text-base ${
                  entry.score < 0 ? 'text-red-400' : 'text-green-400'
                }`}
              >
                {entry.score}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
