import { createSupabaseServer } from '../../../../../lib/supabase/server'
import { tierFromScore } from '../../../../../lib/reputation'

type Props = { params: { game: string; playerId: string } }

export const revalidate = 180

export default async function PlayerPage({ params }: Props) {
  const supabase = createSupabaseServer()

  const { data: gameRow } = await supabase.from('games').select('id, name, slug').eq('slug', params.game).single()
  if (!gameRow) return <div className="container py-12">Game not found.</div>

  const { data: playerRow } = await supabase
    .from('players')
    .select('id, identifier, display_name')
    .eq('id', params.playerId)
    .single()

  if (!playerRow) return <div className="container py-12">Player not found.</div>

  const { data: rep } = await supabase
    .rpc('fn_get_player_profile', { game_slug: params.game, identifier: playerRow.identifier })
    .maybeSingle()

  const repAny = rep as any
  const tier = repAny ? tierFromScore(repAny.score) : 'B'

  const { data: incidents } = await supabase
    .from('incidents')
    .select('id, category_id, description, created_at')
    .eq('reported_player_id', playerRow.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <section className="container py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{playerRow.display_name || playerRow.identifier}</h1>
        <p className="text-white/70">Game: {gameRow.name} • Tier: {tier}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-lg font-semibold">Recent incidents</h2>
          <ul className="space-y-3">
            {(incidents || []).map((it: any) => (
              <li key={it.id} className="rounded border border-white/10 bg-white/5 p-3">
                <div className="text-sm opacity-80">{new Date(it.created_at as any).toLocaleString()}</div>
                <div className="mt-1 text-sm">{it.description}</div>
              </li>
            ))}
          </ul>
        </div>
        <aside className="space-y-2">
          <h3 className="text-lg font-semibold">Reputation summary</h3>
          <div className="rounded border border-white/10 bg-white/5 p-3 text-sm">
            <div>Reports: {repAny?.report_count ?? 0}</div>
            <div>Score: {repAny?.score ?? 0}</div>
            <div className="opacity-80">Last: {repAny?.last_incident_at ? new Date(repAny.last_incident_at).toLocaleDateString() : '—'}</div>
          </div>
        </aside>
      </div>
    </section>
  )
}
