'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'

type UserProfileHeaderProps = {
  displayName: string
  joinedAt: string
  role: 'user' | 'moderator' | 'admin'
  isOwner: boolean
  emailNotifications?: boolean
}

export function UserProfileHeader({
  displayName,
  joinedAt,
  role,
  isOwner,
  emailNotifications = true,
}: UserProfileHeaderProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(emailNotifications)
  const [isTogglingNotifications, setIsTogglingNotifications] = useState(false)

  const roleColors = {
    admin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    moderator: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    user: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  }

  async function toggleNotifications() {
    setIsTogglingNotifications(true)
    try {
      const response = await fetch('/api/notifications/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !notificationsEnabled }),
      })

      if (response.ok) {
        setNotificationsEnabled(!notificationsEnabled)
      } else {
        console.error('Failed to toggle notifications')
      }
    } catch (error) {
      console.error('Error toggling notifications:', error)
    } finally {
      setIsTogglingNotifications(false)
    }
  }

  const joinDate = new Date(joinedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  })

  return (
    <Card className="p-6 border-white/10 bg-white/5 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white">{displayName}</h1>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${roleColors[role]}`}
            >
              {role}
            </span>
          </div>
          <p className="text-white/60">Joined {joinDate}</p>
        </div>

        {isOwner && (
          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/60">Email Notifications</span>
              <button
                onClick={toggleNotifications}
                disabled={isTogglingNotifications}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationsEnabled ? 'bg-brand' : 'bg-white/20'
                } ${isTogglingNotifications ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label="Toggle email notifications"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <p className="text-xs text-white/40">
              {notificationsEnabled
                ? 'You\'ll receive emails when your linked players are reported'
                : 'Email notifications are disabled'}
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
