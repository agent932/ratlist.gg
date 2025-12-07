'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { validateEmbarkID, EMBARK_ID_GAMES } from '@/lib/utils/validate-embark-id'

type Game = { id: string; slug: string; name: string }
type Category = { id: number; slug: string; label: string }

type Props = {
  games: Game[]
  categories: Category[]
}

export function IncidentForm({ games, categories }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [selectedGameSlug, setSelectedGameSlug] = useState<string>('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    const form = e.currentTarget
    const formData = new FormData(form)
    const occurredAt = formData.get('occurred_at') as string
    const identifier = formData.get('identifier') as string
    
    // Validate EmbarkID format for applicable games
    if (selectedGameSlug && EMBARK_ID_GAMES.includes(selectedGameSlug) && !validateEmbarkID(identifier)) {
      setError('Invalid EmbarkID format. Must be in the format: PlayerName#1234')
      setLoading(false)
      return
    }
    
    const payload = {
      game_id: formData.get('game_id'),
      identifier: formData.get('identifier'),
      category_id: parseInt(formData.get('category_id') as string),
      occurred_at: occurredAt ? new Date(occurredAt).toISOString() : undefined,
      description: formData.get('description'),
      region: formData.get('region') || undefined,
      mode: formData.get('mode') || undefined,
      map: formData.get('map') || undefined,
      is_anonymous: formData.get('is_anonymous') === 'on',
    }

    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: { message: 'Unknown error' } }))
        setError(data.error?.message || `Error: ${res.status}`)
      } else {
        const data = await res.json()
        setSuccess(true)
        // Reset form immediately
        form.reset()
        // Redirect to browse page for the selected game after short delay
        setTimeout(() => {
          window.location.href = `/browse?game=${selectedGameSlug}`
        }, 2000)
      }
    } catch (err) {
      setError('Network error - please check your connection and try again')
      console.error('Submission error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-label="Report an incident">
      {error && (
        <div 
          className="rounded bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400" 
          role="alert"
          aria-live="assertive"
        >
          {error}
        </div>
      )}
      {success && (
        <div 
          className="rounded bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-400"
          role="status"
          aria-live="polite"
        >
          Incident submitted successfully! Redirecting to browse page...
        </div>
      )}

      <div>
        <label htmlFor="game-select" className="block text-sm font-medium mb-1">
          Game
        </label>
        <select 
          id="game-select"
          name="game_id" 
          required 
          aria-required="true"
          className="w-full rounded border border-white/10 bg-black/40 px-3 py-2 outline-none ring-brand/50 focus:ring"
          onChange={(e) => {
            const game = games.find(g => g.id === e.target.value);
            setSelectedGameSlug(game?.slug || '');
          }}
        >
          <option value="">Select game</option>
          {games.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>

      {/* Show EmbarkID privacy notice when applicable game is selected */}
      {selectedGameSlug && EMBARK_ID_GAMES.includes(selectedGameSlug) && (
        <div 
          className="flex items-start gap-3 rounded-lg border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-300"
          role="note"
          aria-label="Privacy notice for EmbarkID"
        >
          <svg className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div className="text-left">
            <strong className="font-semibold">Privacy Notice:</strong> This game uses EmbarkIDs. 
            Player identifiers will be truncated in public displays to protect privacy. 
            You will still report using the full identifier (e.g., PlayerName#1234).
          </div>
        </div>
      )}

      <div>
        <label htmlFor="player-identifier" className="block text-sm font-medium mb-1">
          {EMBARK_ID_GAMES.includes(selectedGameSlug) ? 'EmbarkID' : 'Player identifier'}
        </label>
        <Input 
          id="player-identifier"
          name="identifier" 
          placeholder={EMBARK_ID_GAMES.includes(selectedGameSlug) ? "PlayerName#1234" : "PlayerName123"}
          required 
          aria-required="true"
          aria-describedby={EMBARK_ID_GAMES.includes(selectedGameSlug) ? "identifier-help" : undefined}
        />
        {EMBARK_ID_GAMES.includes(selectedGameSlug) && (
          <p id="identifier-help" className="text-xs text-white/40 mt-1">
            Must include the # and numbers (e.g., PlayerName#1234)
          </p>
        )}
      </div>

      <div>
        <label htmlFor="category-select" className="block text-sm font-medium mb-1">
          Incident category
        </label>
        <select 
          id="category-select"
          name="category_id" 
          required 
          aria-required="true"
          className="w-full rounded border border-white/10 bg-black/40 px-3 py-2 outline-none ring-brand/50 focus:ring"
        >
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="occurred-at" className="block text-sm font-medium mb-1">
          When did this happen? (optional)
        </label>
        <Input id="occurred-at" name="occurred_at" type="datetime-local" />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={6}
          minLength={10}
          maxLength={2000}
          required
          aria-required="true"
          aria-describedby="description-help"
          placeholder="Describe what happened..."
          className="w-full rounded border border-white/10 bg-black/40 px-3 py-2 outline-none ring-brand/50 focus:ring"
        />
        <p id="description-help" className="text-xs text-white/40 mt-1">
          10–2000 characters required
        </p>
      </div>

      <fieldset className="grid gap-3 sm:grid-cols-3">
        <legend className="sr-only">Optional incident metadata</legend>
        <div>
          <label htmlFor="region" className="block text-sm font-medium mb-1">
            Region (optional)
          </label>
          <Input id="region" name="region" placeholder="NA, EU, etc." />
        </div>
        <div>
          <label htmlFor="mode" className="block text-sm font-medium mb-1">
            Mode (optional)
          </label>
          <Input id="mode" name="mode" placeholder="Solo, Squad, etc." />
        </div>
        <div>
          <label htmlFor="map" className="block text-sm font-medium mb-1">
            Map (optional)
          </label>
          <Input id="map" name="map" placeholder="Customs, Factory, etc." />
        </div>
      </fieldset>

      <label htmlFor="is-anonymous" className="flex items-center gap-2 text-sm">
        <input 
          id="is-anonymous"
          type="checkbox" 
          name="is_anonymous" 
          className="rounded"
          aria-label="Submit this incident report anonymously"
        />
        Submit anonymously
      </label>

      <Button 
        type="submit" 
        disabled={loading}
        aria-busy={loading}
        aria-label="Submit incident report"
      >
        {loading ? 'Submitting...' : 'Submit incident'}
      </Button>
    </form>
  )
}
