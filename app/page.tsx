import { Hero } from '../components/features/hero/Hero'
import { FeatureCards } from '../components/features/cards/FeatureCards'
import { RecentIncidentsList } from '../components/features/recent-incidents/RecentIncidentsList'
import { createSupabaseServer } from '../lib/supabase/server'

export const revalidate = 60 // Revalidate every 60 seconds

async function getStats() {
  const supabase = createSupabaseServer()
  
  // Get total incidents
  const { count: incidentCount } = await supabase
    .from('incidents')
    .select('*', { count: 'exact', head: true })
  
  // Get total players
  const { count: playerCount } = await supabase
    .from('players')
    .select('*', { count: 'exact', head: true })
  
  // Get total users
  const { count: userCount } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
  
  return {
    incidents: incidentCount || 0,
    players: playerCount || 0,
    users: userCount || 0
  }
}

async function getRecentIncidents() {
  const supabase = createSupabaseServer()
  
  const { data } = await supabase
    .from('incidents')
    .select(`
      id,
      reported_player_id,
      category_id,
      description,
      created_at,
      players!inner (
        identifier,
        display_name
      ),
      games!inner (
        name
      ),
      incident_categories!inner (
        label
      )
    `)
    .order('created_at', { ascending: false })
    .limit(5)
  
  if (!data) return []
  
  return data.map((incident: any) => ({
    id: incident.id,
    reported_player_id: incident.reported_player_id,
    player_identifier: incident.players.identifier,
    player_display_name: incident.players.display_name,
    category_id: incident.category_id,
    category_label: incident.incident_categories.label,
    game_name: incident.games.name,
    description: incident.description,
    created_at: incident.created_at
  }))
}

export default async function HomePage() {
  const [stats, recentIncidents] = await Promise.all([
    getStats(),
    getRecentIncidents()
  ])

  return (
    <>
      <Hero stats={stats} />
      <FeatureCards />
      
      {/* Recent Reports Section */}
      {recentIncidents.length > 0 && (
        <section className="relative py-16 sm:py-24">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand/5 to-transparent" />
          <div className="container relative">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Recent Reports</h2>
              <p className="text-white/60 max-w-2xl mx-auto">
                Latest incidents reported by the community
              </p>
            </div>
            <div className="max-w-4xl mx-auto">
              <RecentIncidentsList incidents={recentIncidents} />
              <div className="mt-8 text-center">
                <a 
                  href="/browse" 
                  className="inline-flex items-center gap-2 text-brand hover:text-brand/80 font-semibold transition-colors"
                >
                  View All Reports
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  )
}
