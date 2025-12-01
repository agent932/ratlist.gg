import { createSupabaseServer } from '@/lib/supabase/server';
import { BrowseFilters } from '@/components/features/browse-filters/BrowseFilters';
import { LeaderboardTable } from '@/components/features/leaderboard/LeaderboardTable';
import { RecentIncidentsList } from '@/components/features/recent-incidents/RecentIncidentsList';

export const revalidate = 180; // ISR cache for 3 minutes

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: { game?: string; period?: string };
}) {
  const supabase = createSupabaseServer();
  const game = searchParams.game || 'tarkov';
  const period = searchParams.period || 'week';

  // Fetch games for filter dropdown
  const { data: games } = await supabase.from('games').select('*').order('name');

  // Fetch leaderboard via RPC
  const { data: leaderboard } = await supabase.rpc('fn_get_leaderboard', {
    game_slug: game,
    period: period,
  });

  // Fetch recent incidents via RPC
  const { data: recentIncidents } = await supabase.rpc('fn_get_recent_incidents', {
    game_slug: game,
    lim: 20,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Browse the Ratlist</h1>

      {/* Filters */}
      <BrowseFilters games={games || []} selectedGame={game} selectedPeriod={period} />

      {/* Leaderboard */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Top Reported Players</h2>
        <LeaderboardTable entries={leaderboard || []} />
      </section>

      {/* Recent Incidents */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Recent Incidents</h2>
        <RecentIncidentsList incidents={recentIncidents || []} />
      </section>
    </div>
  );
}
