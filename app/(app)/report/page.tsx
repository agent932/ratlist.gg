import { createSupabaseServer } from '../../../lib/supabase/server'
import { IncidentForm } from '../../../components/features/incident-form/IncidentForm'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic';

export default async function ReportPage() {
  const supabase = createSupabaseServer()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/sign-in')

  const { data: games } = await supabase.from('games').select('id, slug, name').order('name')
  const { data: categories } = await supabase.from('incident_categories').select('id, slug, label').order('id')

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

      <div className="container relative max-w-3xl py-16 sm:py-24">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm backdrop-blur-sm">
            <svg className="h-4 w-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Incident Reporting
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Report an Incident
            </span>
          </h1>
          
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Share a notable encounter with another player. Be specific and descriptive to help the community make informed decisions.
          </p>
        </div>

        {/* Form container */}
        <div className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-6 sm:p-8">
          <IncidentForm games={games || []} categories={categories || []} />
        </div>

        {/* Guidelines */}
        <div className="mt-8 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <svg className="h-5 w-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Reporting Guidelines
          </h3>
          <ul className="space-y-2 text-sm text-white/70">
            <li className="flex items-start gap-2">
              <span className="text-brand mt-0.5">•</span>
              <span>Describe in-game behavior only - no personal information or doxxing</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand mt-0.5">•</span>
              <span>Be factual and specific - include context like map, mode, and time</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand mt-0.5">•</span>
              <span>No slurs, threats, or harassment - focus on actions, not insults</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand mt-0.5">•</span>
              <span>EmbarkIDs (with # symbols) are truncated publicly but stored in full for accuracy</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand mt-0.5">•</span>
              <span>You can edit or delete reports within 15 minutes of submission</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
