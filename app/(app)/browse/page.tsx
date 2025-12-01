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
    <section className="relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand/5 via-transparent to-transparent" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(to right, rgb(255 255 255 / 0.05) 1px, transparent 1px),
                           linear-gradient(to bottom, rgb(255 255 255 / 0.05) 1px, transparent 1px)`,
          backgroundSize: '4rem 4rem'
        }} />
      </div>

      <div className="container relative mx-auto px-4 py-16 sm:py-24">
        {/* Header */}
        <div className="mb-12">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm backdrop-blur-sm">
            <svg className="h-4 w-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Community Ratlist
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Browse the Ratlist
            </span>
          </h1>
          
          <p className="text-white/60 text-lg max-w-2xl">
            View the most reported players and recent incidents across all supported games
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <BrowseFilters games={games || []} selectedGame={game} selectedPeriod={period} />
        </div>

        {/* Leaderboard */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <svg className="h-6 w-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h2 className="text-2xl sm:text-3xl font-bold">Top Reported Players</h2>
          </div>
          <LeaderboardTable entries={leaderboard || []} />
        </section>

        {/* Recent Incidents */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <svg className="h-6 w-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl sm:text-3xl font-bold">Recent Incidents</h2>
          </div>
          <RecentIncidentsList incidents={recentIncidents || []} />
        </section>
      </div>
    </section>
  );
}
