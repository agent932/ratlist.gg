import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/guards'
import { createSupabaseServer } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { AddGameForm } from './AddGameForm'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Game Management | Admin',
}

export default async function GamesPage() {
  try {
    await requireAdmin()
  } catch {
    redirect('/')
  }

  const supabase = await createSupabaseServer()
  const { data: games } = await supabase
    .from('games')
    .select('id, name, slug, created_at')
    .order('name')

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Game Management</h1>
        <p className="text-white/60">Add and manage supported games</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Add game form */}
        <Card className="p-6 border-white/10 bg-white/5">
          <h2 className="text-lg font-semibold text-white mb-4">Add New Game</h2>
          <AddGameForm />
        </Card>

        {/* Existing games */}
        <Card className="p-6 border-white/10 bg-white/5">
          <h2 className="text-lg font-semibold text-white mb-4">
            Current Games <span className="text-white/40 text-sm font-normal">({games?.length ?? 0})</span>
          </h2>
          <div className="space-y-2">
            {games?.map((game) => (
              <div key={game.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div>
                  <div className="text-sm font-medium text-white">{game.name}</div>
                  <div className="text-xs text-white/40 font-mono">{game.slug}</div>
                </div>
                <div className="text-xs text-white/30">
                  {new Date(game.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
