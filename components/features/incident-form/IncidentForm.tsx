'use client'

import { useState } from 'react'
import { Input } from '../../ui/input'
import { Button } from '../../ui/button'

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    const payload = {
      game_id: formData.get('game_id'),
      identifier: formData.get('identifier'),
      category_id: parseInt(formData.get('category_id') as string),
      occurred_at: formData.get('occurred_at') || undefined,
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
      const data = await res.json()
      if (!res.ok) {
        setError(data.error?.message || 'Failed to submit')
      } else {
        setSuccess(true)
        e.currentTarget.reset()
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="rounded bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">{error}</div>}
      {success && <div className="rounded bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-400">Incident submitted!</div>}

      <div>
        <label className="block text-sm font-medium mb-1">Game</label>
        <select name="game_id" required className="w-full rounded border border-white/10 bg-black/40 px-3 py-2 outline-none ring-brand/50 focus:ring">
          <option value="">Select game</option>
          {games.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Player identifier</label>
        <Input name="identifier" placeholder="PlayerName123" required />
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
