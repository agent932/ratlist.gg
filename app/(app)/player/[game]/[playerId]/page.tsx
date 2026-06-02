import type { Metadata } from 'next'
import { createSupabaseServer } from '../../../../../lib/supabase/server'
import { tierFromScore } from '../../../../../lib/reputation'
import { Card } from '../../../../../components/ui/card'
import { VerifiedBadge } from '../../../../../components/features/player/VerifiedBadge'
import { TierBadge } from '../../../../../components/features/reputation/TierBadge'
import { formatPlayerName } from '../../../../../lib/utils/player'

interface PlayerProfileData {
  score: number
  total_incidents: number
  active_incidents: number
  report_count: number
  last_incident_at: string | null
}

interface PlayerOwnership {
  user_id: string
  display_name: string | null
  linked_at: string
}

interface SimpleIncident {
  id: string
  category_id: number
  description: string
  created_at: string
}

const PAGE_SIZE = 10

type Props = { params: Promise<{ game: string; playerId: string }>; searchParams: Promise<{ page?: string }> }

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { game, playerId } = await params
  const supabase = await createSupabaseServer()

  const decodedPlayerId = decodeURIComponent(playerId)

  const { data: gameRow } = await supabase
    .from('games')
    .select('name')
    .eq('slug', game)
    .single()

  const gameName = gameRow?.name ?? game

  // Strip discriminator for display (e.g. "PlayerName#1234" -> "PlayerName")
  const displayName = decodedPlayerId.includes('#')
    ? decodedPlayerId.split('#')[0]
    : decodedPlayerId

  const title = `${displayName} – ${gameName} | Ratlist.gg`
  const description = `View the community reputation, incident reports, and tier rating for ${displayName} in ${gameName} on Ratlist.gg.`
  const url = `https://ratlist.gg/player/${game}/${playerId}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'Ratlist.gg',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

export default async function PlayerPage({ params, searchParams }: Props) {
  const { game, playerId } = await params
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)
  const supabase = await createSupabaseServer()

  const { data: gameRow } = await supabase
    .from('games')
    .select('id, name, slug')
    .eq('slug', game)
    .single()
  if (!gameRow)
    return (
      <div className="container py-24 text-center">
        <div className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-12">
          <h1 className="text-2xl font-bold text-white/60">Game not found</h1>
        </div>
      </div>
    )

  // Handle both full identifiers (with #) and redacted ones (without #)
  // If no # in the playerId, search for any identifier starting with that name
  const decodedPlayerId = decodeURIComponent(playerId)
  const hasDiscriminator = decodedPlayerId.includes('#')

  let playerQuery = supabase
    .from('players')
    .select('id, identifier, display_name, game_id')
    .eq('game_id', gameRow.id)

  if (hasDiscriminator) {
    // Exact match for full identifier
    playerQuery = playerQuery.eq('identifier', decodedPlayerId)
  } else {
    // Match any identifier starting with the redacted name (e.g., "PlayerName" matches "PlayerName#1234")
    playerQuery = playerQuery.like('identifier', `${decodedPlayerId}#%`)
  }

  const { data: playerRow } = await playerQuery.single()

  if (!playerRow)
    return (
      <div className="container py-24 text-center">
        <div className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-12">
          <h1 className="text-2xl font-bold text-white/60">Player not found</h1>
          <p className="mt-2 text-white/40">
            No reports exist for this player yet
          </p>
        </div>
      </div>
    )

  // Check if player is linked to a user account and get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: ownershipRaw } = await supabase
    .rpc('fn_get_player_ownership', {
      target_player_id: playerRow.identifier,
      target_game_id: gameRow.id,
    })
    .maybeSingle()
  const ownership = ownershipRaw as PlayerOwnership | null

  // Check if current user is the owner
  const isOwner: boolean = !!(user && ownership && ownership.user_id === user.id)

  const rep = await supabase
    .rpc('fn_get_player_profile', {
      game_slug: game,
      identifier: playerRow.identifier,
    })
    .maybeSingle()

  const profileData = rep.data as PlayerProfileData | null
  const tier = profileData ? tierFromScore(profileData.score) : 'B'
  const offset = (page - 1) * PAGE_SIZE
  const { data: incidents, count: totalIncidents } = await supabase
    .from('incidents')
    .select('id, category_id, description, created_at', { count: 'exact' })
    .eq('reported_player_id', playerRow.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  const totalPages = Math.ceil((totalIncidents ?? 0) / PAGE_SIZE)

  return (
    <section className="relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand/5 via-transparent to-transparent" />
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(to right, rgb(255 255 255 / 0.05) 1px, transparent 1px),
                           linear-gradient(to bottom, rgb(255 255 255 / 0.05) 1px, transparent 1px)`,
            backgroundSize: '4rem 4rem',
          }}
        />
      </div>

      <div className="container relative py-16 sm:py-24">
        {/* Header */}
        <div className="mb-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm backdrop-blur-sm">
            <svg
              className="h-4 w-4 text-brand"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Player Profile
          </div>

          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <h1 className="text-4xl sm:text-5xl font-bold">
              {formatPlayerName(
                playerRow.display_name || playerRow.identifier,
                isOwner
              )}
            </h1>
            {ownership && ownership.display_name && (
              <VerifiedBadge
                username={ownership.display_name}
                linkedAt={ownership.linked_at}
              />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-white/60">
            <span className="flex items-center gap-2">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
              {gameRow.name}
            </span>
            <span className="flex items-center gap-2">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
              Tier: <TierBadge tier={tier} size="sm" />
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Incidents list */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">
              Recent Incidents
            </h2>

            {incidents && incidents.length > 0 ? (
              <div className="space-y-3">
                {incidents.map((incident: SimpleIncident) => (
                  <Card
                    key={incident.id}
                    className="p-4 border-white/10 bg-white/5 backdrop-blur-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs text-white/50">
                        {new Date(incident.created_at).toLocaleDateString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )}
                      </span>
                    </div>
                    <p className="text-white/90 leading-relaxed mb-3">
                      {incident.description}
                    </p>
                    <a
                      href={`/incident/${incident.id}`}
                      className="text-xs text-brand hover:text-brand/80 transition-colors"
                    >
                      View incident →
                    </a>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center border-white/10 bg-white/5 backdrop-blur-sm">
                <p className="text-white/60">No incidents reported yet</p>
              </Card>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 gap-4">
                <a
                  href={page > 1 ? `?page=${page - 1}` : undefined}
                  aria-disabled={page <= 1}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    page <= 1
                      ? 'border-white/5 text-white/20 pointer-events-none'
                      : 'border-white/20 text-white/70 hover:text-white hover:border-white/40'
                  }`}
                >
                  ← Previous
                </a>
                <span className="text-sm text-white/40">
                  Page {page} of {totalPages}
                </span>
                <a
                  href={page < totalPages ? `?page=${page + 1}` : undefined}
                  aria-disabled={page >= totalPages}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    page >= totalPages
                      ? 'border-white/5 text-white/20 pointer-events-none'
                      : 'border-white/20 text-white/70 hover:text-white hover:border-white/40'
                  }`}
                >
                  Next →
                </a>
              </div>
            )}
          </div>

          {/* Reputation sidebar */}
          <aside className="order-1 lg:order-2">
            <h3 className="text-lg sm:text-xl font-semibold mb-4">
              Reputation Summary
            </h3>

            <Card className="p-6 border-white/10 bg-white/5 backdrop-blur-sm space-y-5">
              {/* Tier + score hero */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Tier Rating</div>
                  <TierBadge tier={tier} size="lg" />
                </div>
                <div className="text-right">
                  <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Score</div>
                  <div className={`text-3xl font-bold ${(profileData?.score ?? 0) < 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {profileData?.score ?? 0}
                  </div>
                </div>
              </div>

              {/* Reputation bar — F(-20) to S(+10) */}
              {(() => {
                const score = profileData?.score ?? 0
                const MIN = -25; const MAX = 15
                const pct = Math.round(((score - MIN) / (MAX - MIN)) * 100)
                const clamped = Math.min(100, Math.max(0, pct))
                const barColor = score <= -20 ? 'bg-red-500' : score <= -10 ? 'bg-orange-500' : score <= -3 ? 'bg-yellow-500' : score < 3 ? 'bg-slate-400' : score < 10 ? 'bg-blue-400' : 'bg-green-500'
                return (
                  <div>
                    <div className="flex justify-between text-xs text-white/30 mb-1.5">
                      <span>F</span>
                      <span className="text-white/50 text-xs">Reputation</span>
                      <span>S</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${clamped}%` }} />
                    </div>
                  </div>
                )
              })()}

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-white/10">
                <div>
                  <div className="text-xs text-white/40 mb-0.5">Total Reports</div>
                  <div className="text-xl font-bold">{profileData?.report_count ?? 0}</div>
                </div>
                <div>
                  <div className="text-xs text-white/40 mb-0.5">Last Incident</div>
                  <div className="text-sm text-white/70">
                    {profileData?.last_incident_at
                      ? new Date(profileData.last_incident_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : '—'}
                  </div>
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
