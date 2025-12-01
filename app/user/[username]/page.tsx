// T007: User profile page
import { redirect } from 'next/navigation'
import { getCurrentUserWithRole } from '@/lib/auth/guards'
import { Card } from '@/components/ui/card'
import { UserProfileHeader } from '@/components/features/user/UserProfileHeader'
import { LinkedPlayerCard } from '@/components/features/user/LinkedPlayerCard'
import { LinkPlayerForm } from '@/components/features/user/LinkPlayerForm'
import type { LinkedPlayer } from '@/lib/types'

type PageProps = {
  params: { username: string }
}

export async function generateMetadata({ params }: PageProps) {
  return {
    title: `${params.username} | User Profile`,
    description: `View ${params.username}'s profile and linked player IDs`,
  }
}

async function getUserProfile(username: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/user/${username}`,
    { cache: 'no-store' }
  )

  if (!response.ok) {
    return null
  }

  return response.json()
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = params
  const currentUser = await getCurrentUserWithRole()
  
  const profile = await getUserProfile(username)
  
  if (!profile) {
    redirect('/404')
  }

  const isOwner = currentUser?.displayName === username
  const isAdmin = currentUser?.role === 'admin'

  return (
    <div className="container mx-auto py-8 px-4">
      <UserProfileHeader
        displayName={profile.display_name}
        joinedAt={profile.joined_at}
        role={profile.role}
        isOwner={isOwner}
        emailNotifications={profile.private?.email_notifications}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-6 border-white/10 bg-white/5">
          <div className="text-sm text-white/60 mb-1">Linked Players</div>
          <div className="text-3xl font-bold text-white">
            {profile.stats.total_linked_players}
          </div>
        </Card>

        <Card className="p-6 border-white/10 bg-white/5">
          <div className="text-sm text-white/60 mb-1">Total Incidents</div>
          <div className="text-3xl font-bold text-white">
            {profile.stats.total_incidents}
          </div>
        </Card>

        <Card className="p-6 border-white/10 bg-white/5">
          <div className="text-sm text-white/60 mb-1">Games Played</div>
          <div className="text-3xl font-bold text-white">
            {profile.linked_players.length}
          </div>
        </Card>
      </div>

      {/* Admin Section */}
      {isAdmin && profile.admin && (
        <Card className="p-6 border-red-500/20 bg-red-500/5 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Admin Info</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-white/60">User ID:</span>
              <span className="text-white/90 font-mono">{profile.admin.user_id}</span>
            </div>
            {profile.admin.is_suspended && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Suspended Until:</span>
                  <span className="text-red-400">
                    {new Date(profile.admin.suspended_until).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-white/60">Reason:</span>
                  <span className="text-white/90 text-right max-w-xs">
                    {profile.admin.suspension_reason}
                  </span>
                </div>
              </>
            )}
          </div>
        </Card>
      )}

      {/* Linked Players Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Linked Players</h2>
        {profile.linked_players.length === 0 ? (
          <Card className="p-8 text-center border-white/10 bg-white/5">
            <p className="text-white/60">
              {isOwner
                ? 'You haven\'t linked any player IDs yet'
                : `${username} hasn't linked any player IDs`}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {profile.linked_players.map((player: LinkedPlayer) => (
              <LinkedPlayerCard
                key={`${player.player_id}-${player.game_id}`}
                playerId={player.player_id}
                gameId={player.game_id}
                gameName={player.game_name}
                linkedAt={player.linked_at}
                incidentCount={player.incident_count || 0}
                canUnlink={isOwner}
                onUnlink={() => window.location.reload()}
              />
            ))}
          </div>
        )}
      </div>

      {/* Link Player Form (Owner Only) */}
      {isOwner && (
        <LinkPlayerForm onSuccess={() => window.location.reload()} />
      )}

      {/* Private Info (Owner Only) */}
      {isOwner && profile.private && (
        <Card className="p-6 border-white/10 bg-white/5 mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">Account Settings</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-white/60">Email:</span>
              <span className="text-white/90">{profile.private.email}</span>
            </div>
            {profile.private.last_notification_sent && (
              <div className="flex items-center justify-between">
                <span className="text-white/60">Last Notification:</span>
                <span className="text-white/90">
                  {new Date(profile.private.last_notification_sent).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
