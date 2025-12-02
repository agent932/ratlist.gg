'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { validateEmbarkID, EMBARK_ID_GAMES } from '@/lib/utils/validate-embark-id'

type Game = {
  id: string
  name: string
  slug: string
}

type LinkPlayerFormProps = {
  onSuccess?: () => void
}

export function LinkPlayerForm({ onSuccess }: LinkPlayerFormProps) {
  const [games, setGames] = useState<Game[]>([])
  const [selectedGameId, setSelectedGameId] = useState('')
  const [selectedGameSlug, setSelectedGameSlug] = useState('')
  const [playerId, setPlayerId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Fetch available games
    fetch('/api/games')
      .then((res) => res.json())
      .then((data) => {
        setGames(data.games || [])
        if (data.games?.length > 0) {
          setSelectedGameId(data.games[0].id)
          setSelectedGameSlug(data.games[0].slug)
        }
      })
      .catch((err) => console.error('Failed to fetch games:', err))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setIsLoading(true)

    // Validate EmbarkID format for applicable games
    if (EMBARK_ID_GAMES.includes(selectedGameSlug) && !validateEmbarkID(playerId.trim())) {
      setError('Invalid EmbarkID format. Must be in the format: PlayerName#1234')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/user/link-player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: playerId.trim(),
          game_id: selectedGameId,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setPlayerId('')
        onSuccess?.()
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(data.error || 'Failed to link player')
      }
    } catch (err) {
      setError('An error occurred while linking the player')
      console.error('Error linking player:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-6 border-white/10 bg-white/5">
      <h3 className="text-lg font-semibold text-white mb-4">Link a Player ID</h3>
      <p className="text-sm text-white/60 mb-6">
        Link your in-game player name to receive notifications when someone reports you
      </p>

      <form onSubmit={handleSubmit} className="space-y-4" aria-label="Link player ID form">
        <div>
          <label htmlFor="game" className="block text-sm font-medium text-white/80 mb-2">
            Game
          </label>
          <select
            id="game"
            value={selectedGameId}
            onChange={(e) => {
              const game = games.find(g => g.id === e.target.value);
              setSelectedGameId(e.target.value);
              setSelectedGameSlug(game?.slug || '');
            }}
            className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand"
            required
            aria-required="true"
          >
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="playerId" className="block text-sm font-medium text-white/80 mb-2">
            {EMBARK_ID_GAMES.includes(selectedGameSlug) ? 'EmbarkID' : 'Player ID / In-Game Name'}
          </label>
          <input
            id="playerId"
            type="text"
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
            placeholder={EMBARK_ID_GAMES.includes(selectedGameSlug) ? "PlayerName#1234" : "Enter your player name"}
            className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-brand"
            required
            aria-required="true"
            aria-describedby="playerId-help"
            maxLength={100}
          />
          <p id="playerId-help" className="text-xs text-white/40 mt-1">
            {EMBARK_ID_GAMES.includes(selectedGameSlug) 
              ? 'Must include the # and numbers (e.g., PlayerName#1234)'
              : 'This should match exactly how your name appears in the game'}
          </p>
        </div>

        {error && (
          <div role="alert" aria-live="assertive" className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div role="status" aria-live="polite" className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
            Player ID linked successfully! You&apos;ll now receive notifications for this player.
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !playerId.trim() || !selectedGameId}
          className="w-full px-4 py-2 bg-brand hover:bg-brand/90 text-brand-foreground rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-busy={isLoading}
        >
          {isLoading ? 'Linking...' : 'Link Player'}
        </button>
      </form>
    </Card>
  )
}
