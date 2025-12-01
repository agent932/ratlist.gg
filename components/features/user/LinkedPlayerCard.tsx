'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { formatPlayerName } from '@/lib/utils/player'

type LinkedPlayerCardProps = {
  playerId: string
  gameId: string
  gameName: string
  linkedAt: string
  incidentCount: number
  canUnlink: boolean
  onUnlink?: () => void
}

export function LinkedPlayerCard({
  playerId,
  gameId,
  gameName,
  linkedAt,
  incidentCount,
  canUnlink,
  onUnlink,
}: LinkedPlayerCardProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isUnlinking, setIsUnlinking] = useState(false)

  async function handleUnlink() {
    setIsUnlinking(true)
    try {
      const response = await fetch('/api/user/unlink-player', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_id: playerId, game_id: gameId }),
      })

      if (response.ok) {
        setShowConfirmDialog(false)
        onUnlink?.()
      } else {
        const data = await response.json()
        console.error('Failed to unlink player:', data.error)
        alert(data.error || 'Failed to unlink player')
      }
    } catch (error) {
      console.error('Error unlinking player:', error)
      alert('An error occurred while unlinking the player')
    } finally {
      setIsUnlinking(false)
    }
  }

  const linkedDate = new Date(linkedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <>
      <Card className="p-4 border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Link
                href={`/player/${playerId}`}
                className="text-lg font-semibold text-white hover:text-brand transition-colors"
              >
                {formatPlayerName(playerId, true)}
              </Link>
              <span className="inline-flex items-center rounded-full border border-brand/30 bg-brand/20 px-2.5 py-0.5 text-xs font-semibold text-brand">
                {gameName}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-white/60">
              <span>Linked {linkedDate}</span>
              <span>•</span>
              <span>
                {incidentCount} {incidentCount === 1 ? 'incident' : 'incidents'}
              </span>
            </div>
          </div>

          {canUnlink && (
            <button
              onClick={() => setShowConfirmDialog(true)}
              className="px-4 py-2 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-medium transition-colors"
            >
              Unlink
            </button>
          )}
        </div>
      </Card>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <Card className="max-w-md p-6 border-white/10 bg-black">
            <h3 className="text-xl font-semibold text-white mb-3">Unlink Player?</h3>
            <p className="text-white/60 mb-6">
              Are you sure you want to unlink <strong className="text-white">{formatPlayerName(playerId, true)}</strong> from{' '}
              <strong className="text-white">{gameName}</strong>? You won&apos;t receive notifications for this
              player anymore.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmDialog(false)}
                disabled={isUnlinking}
                className="px-4 py-2 rounded-lg border border-white/10 text-white/80 hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUnlink}
                disabled={isUnlinking}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors disabled:opacity-50"
              >
                {isUnlinking ? 'Unlinking...' : 'Unlink Player'}
              </button>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}
