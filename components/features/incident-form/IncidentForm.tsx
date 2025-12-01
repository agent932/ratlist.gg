'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type Game = { id: string; slug: string; name: string }
type Category = { id: number; slug: string; label: string }

type Props = {
  games: Game[]
  categories: Category[]
}

// Games that use EmbarkID format (with # symbols)
const EMBARK_ID_GAMES = ['the-finals', 'arc-raiders'];

// Validate EmbarkID format: PlayerName#1234 (at least one char before #, at least one digit after)
function validateEmbarkID(value: string): boolean {
  const embarkIdPattern = /^.+#\d+$/;
  return embarkIdPattern.test(value);
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

    const formData = new FormData(e.currentTarget)
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
        e.currentTarget.reset()
        // Redirect to player page after short delay using game slug
        setTimeout(() => {
          window.location.href = `/player/${selectedGameSlug}/${formData.get('identifier')}`
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="rounded bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">{error}</div>}
      {success && <div className="rounded bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-400">Incident submitted successfully! Redirecting to player profile...</div>}

      <div>
        <label className="block text-sm font-medium mb-1">Game</label>
        <select 
          name="game_id" 
          required 
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
        <div className="flex items-start gap-3 rounded-lg border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-300">
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
        <label className="block text-sm font-medium mb-1">
          {EMBARK_ID_GAMES.includes(selectedGameSlug) ? 'EmbarkID' : 'Player identifier'}
        </label>
        <Input 
          name="identifier" 
          placeholder={EMBARK_ID_GAMES.includes(selectedGameSlug) ? "PlayerName#1234" : "PlayerName123"}
          required 
        />
        {EMBARK_ID_GAMES.includes(selectedGameSlug) && (
          <p className="text-xs text-white/40 mt-1">
            Must include the # and numbers (e.g., PlayerName#1234)
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Incident category</label>
        <select name="category_id" required className="w-full rounded border border-white/10 bg-black/40 px-3 py-2 outline-none ring-brand/50 focus:ring">
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">When did this happen? (optional)</label>
        <Input name="occurred_at" type="datetime-local" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description (10–2000 chars)</label>
        <textarea
          name="description"
          rows={6}
          minLength={10}
          maxLength={2000}
          required
          placeholder="Describe what happened..."
          className="w-full rounded border border-white/10 bg-black/40 px-3 py-2 outline-none ring-brand/50 focus:ring"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium mb-1">Region (optional)</label>
          <Input name="region" placeholder="NA, EU, etc." />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mode (optional)</label>
          <Input name="mode" placeholder="Solo, Squad, etc." />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Map (optional)</label>
          <Input name="map" placeholder="Customs, Factory, etc." />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_anonymous" className="rounded" />
        Submit anonymously
      </label>

      <Button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit incident'}
      </Button>
    </form>
  )
}
