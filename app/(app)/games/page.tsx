import { createSupabaseServer } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';

export default async function GamesPage() {
  const supabase = createSupabaseServer();
  
  const { data: games } = await supabase
    .from('games')
    .select('id, slug, name, created_at')
    .order('name');

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
        <div className="text-center mb-16">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm backdrop-blur-sm">
            <svg className="h-4 w-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            Multi-Game Platform
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Supported Games
            </span>
          </h1>
          
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Browse incidents and player reputations for these extraction shooters and tactical games
          </p>
        </div>

        {/* Games grid */}
        {games && games.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {games.map((game) => (
              <Card key={game.id} className="group relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm p-6 hover:bg-white/10 transition-all duration-300">
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Content */}
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-lg bg-brand/10">
                      <svg className="h-6 w-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-semibold">{game.name}</h2>
                  </div>
                  
                  <p className="text-sm text-white/60 mb-6">
                    View player profiles, incident reports, and community reputation data
                  </p>
                  
                  <div className="flex gap-3">
                    <a 
                      href={`/browse?game=${game.slug}`}
                      className="flex-1 text-center rounded-lg bg-brand hover:bg-brand/90 px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-colors"
                    >
                      Browse
                    </a>
                    <a 
                      href={`/report?game=${game.slug}`}
                      className="flex-1 text-center rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-sm font-semibold transition-colors"
                    >
                      Report
                    </a>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center border-white/10 bg-white/5 backdrop-blur-sm max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
              <svg className="h-8 w-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">No Games Configured</h3>
            <p className="text-white/60">Games will appear here once they are added to the platform</p>
          </Card>
        )}

        {/* Bottom info */}
        <div className="mt-16 text-center">
          <div className="inline-block rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-8 max-w-2xl">
            <h3 className="text-xl font-semibold mb-3">Don&apos;t see your game?</h3>
            <p className="text-white/60 mb-4">
              We&apos;re continuously expanding our support for extraction shooters and tactical games. 
              Check back regularly for updates or reach out to suggest a new game.
            </p>
            <a 
              href="/faq" 
              className="inline-block rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 px-6 py-3 font-semibold transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
