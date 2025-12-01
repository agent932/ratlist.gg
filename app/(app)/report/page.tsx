import { createSupabaseServer } from '../../../lib/supabase/server'
import { IncidentForm } from '../../../components/features/incident-form/IncidentForm'
import { redirect } from 'next/navigation'

export default async function ReportPage() {
  const supabase = createSupabaseServer()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/sign-in')

  const { data: games } = await supabase.from('games').select('id, slug, name').order('name')
  const { data: categories } = await supabase.from('incident_categories').select('id, slug, label').order('id')

  return (
    <section className="container max-w-2xl py-12">
      <h1 className="text-3xl font-bold">Report an incident</h1>
      <p className="mt-2 text-white/80">
        Share a notable encounter with another player. Be specific and descriptive.
      </p>
      <div className="mt-8">
        <IncidentForm games={games || []} categories={categories || []} />
      </div>
    </section>
  )
}
