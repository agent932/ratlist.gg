import { createSupabaseServer } from '../../../../../lib/supabase/server'
import { tierFromScore } from '../../../../../lib/reputation'
import { Card } from '../../../../../components/ui/card'

type Props = { params: { game: string; playerId: string } }

export const revalidate = 180

export default async function PlayerPage({ params }: Props) {
  const supabase = createSupabaseServer()

  const { data: gameRow } = await supabase.from('games').select('id, name, slug').eq('slug', params.game).single()
  if (!gameRow) return (
    <div className="container py-24 text-center">
      <div className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-12">
        <h1 className="text-2xl font-bold text-white/60">Game not found</h1>
      </div>
    </div>
  )

  const { data: playerRow } = await supabase
    .from('players')
    .select('id, identifier, display_name, game_id')
    .eq('identifier', params.playerId)
    .eq('game_id', gameRow.id)
    .single()

  if (!playerRow) return (
    <div className="container py-24 text-center">
      <div className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-12">
        <h1 className="text-2xl font-bold text-white/60">Player not found</h1>
        <p className="mt-2 text-white/40">No reports exist for this player yet</p>
      </div>
    </div>
  )

  const { data: rep } = await supabase
    .rpc('fn_get_player_profile', { game_slug: params.game, identifier: playerRow.identifier })
    .maybeSingle()

  const repAny = rep as any
  const tier = repAny ? tierFromScore(repAny.score) : 'B'
  const tierColors: Record<string, string> = {
    'S': 'text-green-400',
    'A': 'text-blue-400',
    'B': 'text-slate-400',
    'C': 'text-yellow-400',
    'D': 'text-orange-400',
    'F': 'text-red-400'
  }

  const { data: incidents } = await supabase
    .from('incidents')
    .select('id, category_id, description, created_at')
    .eq('reported_player_id', playerRow.id)
    .order('created_at', { ascending: false })
    .limit(20)

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

      <div className="container relative py-16 sm:py-24">
        {/* Header */}
        <div className="mb-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm backdrop-blur-sm">
            <svg className="h-4 w-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Player Profile
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold mb-2">
            {playerRow.display_name || playerRow.identifier}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-white/60">
            <span className="flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              {gameRow.name}
            </span>
            <span className="flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              Tier: <span className={`font-bold ${tierColors[tier]}`}>{tier}</span>
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Incidents list */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-4">Recent Incidents</h2>
            
            {incidents && incidents.length > 0 ? (
              <div className="space-y-3">
                {incidents.map((incident: any) => (
                  <Card key={incident.id} className="p-4 border-white/10 bg-white/5 backdrop-blur-sm">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs text-white/50">
                        {new Date(incident.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-white/90 leading-relaxed">{incident.description}</p>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center border-white/10 bg-white/5 backdrop-blur-sm">
                <p className="text-white/60">No incidents reported yet</p>
              </Card>
            )}
          </div>

          {/* Reputation sidebar */}
          <aside>
            <h3 className="text-xl font-semibold mb-4">Reputation Summary</h3>
            
            <Card className="p-6 border-white/10 bg-white/5 backdrop-blur-sm space-y-4">
              <div>
                <div className="text-sm text-white/60 mb-1">Total Reports</div>
                <div className="text-3xl font-bold">{repAny?.report_count ?? 0}</div>
              </div>
              
              <div className="border-t border-white/10 pt-4">
                <div className="text-sm text-white/60 mb-1">Reputation Score</div>
                <div className={`text-3xl font-bold ${(repAny?.score ?? 0) < 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {repAny?.score ?? 0}
                </div>
              </div>
              
              <div className="border-t border-white/10 pt-4">
                <div className="text-sm text-white/60 mb-1">Tier Rating</div>
                <div className={`text-4xl font-bold ${tierColors[tier]}`}>{tier}</div>
              </div>
              
              <div className="border-t border-white/10 pt-4">
                <div className="text-sm text-white/60 mb-1">Last Incident</div>
                <div className="text-sm">
                  {repAny?.last_incident_at 
                    ? new Date(repAny.last_incident_at).toLocaleDateString() 
                    : 'No incidents'}
                </div>
              </div>
            </Card>

            {/* Report button */}
            <a 
              href="/report" 
              className="mt-4 block w-full rounded-lg bg-brand hover:bg-brand/90 px-4 py-3 font-semibold text-brand-foreground text-center transition-colors"
            >
              Report This Player
            </a>
          </aside>
        </div>
      </div>
    </section>
  )
}
