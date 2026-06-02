import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServer, createSupabaseAdmin } from '../../../../lib/supabase/server'
import { CATEGORY_COLORS } from '../../../../lib/constants/colors'
import { tierFromScore, scoreFromCounts } from '../../../../lib/reputation'
import { formatPlayerName, playerProfileUrl } from '../../../../lib/utils/player'
import { Card } from '../../../../components/ui/card'
import { Badge } from '../../../../components/ui/badge'
import { IncidentFlagButton } from '../../../../components/features/incident/IncidentFlagButton'

type Props = { params: Promise<{ incidentId: string }> }

export const revalidate = 60

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { incidentId } = await params
  const supabase = createSupabaseAdmin()

  const { data } = await supabase
    .from('incidents')
    .select('description, incident_categories(label), games(name)')
    .eq('id', incidentId)
    .eq('status', 'active')
    .single()

  if (!data) {
    return { title: 'Incident Not Found | Ratlist.gg' }
  }

  const toObj = <T,>(v: T | T[]): T => (Array.isArray(v) ? v[0] : v)
  const category = toObj(data.incident_categories as any) as any
  const game = toObj(data.games as any) as any
  const desc = data.description.slice(0, 160)

  return {
    title: `${category?.label ?? 'Incident'} in ${game?.name ?? 'Unknown'} | Ratlist.gg`,
    description: desc,
    openGraph: {
      title: `${category?.label ?? 'Incident'} in ${game?.name ?? 'Unknown'} | Ratlist.gg`,
      description: desc,
      siteName: 'Ratlist.gg',
      type: 'website',
    },
    twitter: { card: 'summary', title: `${category?.label ?? 'Incident'} | Ratlist.gg`, description: desc },
  }
}

export default async function IncidentDetailPage({ params }: Props) {
  const { incidentId } = await params
  const supabase = await createSupabaseServer()
  const adminClient = createSupabaseAdmin()

  // Fetch full incident with joins
  const { data: incident } = await adminClient
    .from('incidents')
    .select(`
      id, description, region, mode, map, is_anonymous, status, created_at, occurred_at,
      incident_categories(id, label, slug),
      games(id, name, slug),
      players!incidents_reported_player_id_fkey(id, identifier, display_name)
    `)
    .eq('id', incidentId)
    .single()

  if (!incident || incident.status === 'removed') notFound()

  const toObj = <T,>(v: T | T[]): T => (Array.isArray(v) ? v[0] : v)
  const category = toObj(incident.incident_categories as any) as any
  const game = toObj(incident.games as any) as any
  const player = toObj(incident.players as any) as any

  // Flag count
  const { count: flagCount } = await adminClient
    .from('flags')
    .select('id', { count: 'exact', head: true })
    .eq('incident_id', incidentId)
    .eq('status', 'open')

  // Reporter display (anonymous-aware) + verified status
  let reporterName: string | null = null
  let reporterVerified = false
  if (!incident.is_anonymous && (incident as any).reporter_user_id) {
    const [profileRes, linkRes] = await Promise.all([
      adminClient
        .from('user_profiles')
        .select('display_name')
        .eq('user_id', (incident as any).reporter_user_id)
        .maybeSingle(),
      adminClient
        .from('player_links')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', (incident as any).reporter_user_id),
    ])
    reporterName = profileRes.data?.display_name ?? null
    reporterVerified = (linkRes.count ?? 0) > 0
  }

  // Player reputation — direct query to avoid RPC inconsistency
  const { data: playerIncidents } = await adminClient
    .from('incidents')
    .select('incident_categories(slug)')
    .eq('reported_player_id', player.id)
    .eq('status', 'active')
  const toObjSlug = <T,>(v: T | T[]): T => Array.isArray(v) ? v[0] : v
  const categoryCounts: Record<string, number> = {}
  for (const inc of playerIncidents ?? []) {
    const cat = inc.incident_categories ? toObjSlug(inc.incident_categories as any) as { slug: string } : null
    if (cat?.slug) categoryCounts[cat.slug] = (categoryCounts[cat.slug] ?? 0) + 1
  }
  const score = scoreFromCounts(categoryCounts)
  const tier = tierFromScore(score)

  // Dispute/response (if table exists)
  const { data: response } = await adminClient
    .from('incident_responses')
    .select('body, created_at')
    .eq('incident_id', incidentId)
    .maybeSingle()

  // Current user (for flag button)
  const { data: { user } } = await supabase.auth.getUser()

  const tierColors: Record<string, string> = {
    S: 'text-green-400', A: 'text-blue-400', B: 'text-slate-400',
    C: 'text-yellow-400', D: 'text-orange-400', F: 'text-red-400',
  }

  const categoryColor =
    CATEGORY_COLORS[category?.label as keyof typeof CATEGORY_COLORS] ??
    'bg-slate-500/10 text-slate-400 border-slate-500/20'

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-brand/5 via-transparent to-transparent" />

      <div className="container relative py-16 sm:py-24 max-w-3xl">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-white/50 flex items-center gap-2">
          <Link href="/browse" className="hover:text-white transition-colors">Browse</Link>
          <span>/</span>
          <Link
            href={playerProfileUrl(game.slug, player.identifier)}
            className="hover:text-white transition-colors"
          >
            {formatPlayerName(player.display_name || player.identifier)}
          </Link>
          <span>/</span>
          <span className="text-white/30">Incident</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm backdrop-blur-sm">
            <svg className="h-4 w-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Incident Report
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge className={categoryColor}>{category?.label ?? 'Unknown'}</Badge>
            <Badge variant="outline" className="border-white/20 text-white/60">{game.name}</Badge>
            {incident.status === 'hidden' && (
              <Badge variant="outline" className="border-yellow-500/30 text-yellow-400">Hidden</Badge>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Report: {formatPlayerName(player.display_name || player.identifier)}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-white/50">
            <span>
              Filed{' '}
              {new Date(incident.created_at).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </span>
            {reporterName && (
              <span className="flex items-center gap-1.5">
                by <span className="text-white/70">{reporterName}</span>
                {reporterVerified && (
                  <span title="This reporter has a linked player account" className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    Verified
                  </span>
                )}
              </span>
            )}
            {incident.is_anonymous && <span className="italic">Anonymous report</span>}
          </div>
        </div>

        {/* Main card */}
        <Card className="p-6 border-white/10 bg-white/5 backdrop-blur-sm mb-6">
          <h2 className="text-lg font-semibold mb-3">Description</h2>
          <p className="text-white/90 leading-relaxed whitespace-pre-wrap">{incident.description}</p>

          {/* Details grid */}
          {(incident.region || incident.mode || incident.map || incident.occurred_at) && (
            <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              {incident.region && (
                <div>
                  <div className="text-white/40 mb-1">Region</div>
                  <div className="text-white/80 font-medium">{incident.region}</div>
                </div>
              )}
              {incident.mode && (
                <div>
                  <div className="text-white/40 mb-1">Mode</div>
                  <div className="text-white/80 font-medium">{incident.mode}</div>
                </div>
              )}
              {incident.map && (
                <div>
                  <div className="text-white/40 mb-1">Map</div>
                  <div className="text-white/80 font-medium">{incident.map}</div>
                </div>
              )}
              {incident.occurred_at && (
                <div>
                  <div className="text-white/40 mb-1">Occurred</div>
                  <div className="text-white/80 font-medium">
                    {new Date(incident.occurred_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Reported player card */}
        <Card className="p-6 border-white/10 bg-white/5 backdrop-blur-sm mb-6">
          <h2 className="text-lg font-semibold mb-4">Reported Player</h2>
          <div className="flex items-center justify-between">
            <div>
              <Link
                href={playerProfileUrl(game.slug, player.identifier)}
                className="text-xl font-bold text-white hover:text-brand transition-colors"
              >
                {formatPlayerName(player.display_name || player.identifier)}
              </Link>
              <div className="text-sm text-white/50 mt-1">{game.name}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-white/40 mb-1">Tier</div>
              <div className={`text-3xl font-bold ${tierColors[tier]}`}>{tier}</div>
            </div>
          </div>
        </Card>

        {/* Player response */}
        {response && (
          <Card className="p-6 border-blue-500/20 bg-blue-500/5 backdrop-blur-sm mb-6">
            <div className="flex items-center gap-2 mb-3">
              <svg className="h-4 w-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h2 className="text-lg font-semibold text-blue-300">Player's Response</h2>
              <span className="text-xs text-white/40 ml-auto">
                {new Date(response.created_at).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'short', day: 'numeric',
                })}
              </span>
            </div>
            <p className="text-white/80 leading-relaxed whitespace-pre-wrap">{response.body}</p>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href={playerProfileUrl(game.slug, player.identifier)}
            className="text-sm text-white/50 hover:text-white transition-colors flex items-center gap-1"
          >
            ← View full player profile
          </Link>

          <div className="flex items-center gap-3">
            {(flagCount ?? 0) > 0 && (
              <span className="text-xs text-white/30">{flagCount} open flag{(flagCount ?? 0) !== 1 ? 's' : ''}</span>
            )}
            {user && (
              <IncidentFlagButton incidentId={incidentId} />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
