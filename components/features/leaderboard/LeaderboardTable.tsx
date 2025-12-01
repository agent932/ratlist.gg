import { Card } from '@/components/ui/card';

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
    <Card className="p-6">
      <table className="w-full">
        <thead>
          <tr className="text-left border-b border-slate-700">
            <th className="pb-2">Rank</th>
            <th className="pb-2">Player</th>
            <th className="pb-2 text-right">Reports</th>
            <th className="pb-2 text-right">Score</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => (
            <tr key={entry.player_id} className="border-b border-slate-800">
              <td className="py-3">{idx + 1}</td>
              <td className="py-3 font-mono text-sm">{entry.display_name || entry.identifier}</td>
              <td className="py-3 text-right">{entry.report_count}</td>
              <td
                className={`py-3 text-right font-semibold ${
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
