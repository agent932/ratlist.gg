'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function AddGameForm() {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleNameChange = (val: string) => {
    setName(val)
    // Auto-generate slug from name
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch('/api/admin/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), slug: slug.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to create game')
        return
      }
      setSuccess(true)
      setName('')
      setSlug('')
      setTimeout(() => window.location.reload(), 1000)
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">{error}</div>
      )}
      {success && (
        <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-400">
          Game added successfully!
        </div>
      )}

      <div>
        <label htmlFor="game-name" className="block text-sm font-medium text-white/70 mb-1">Game Name</label>
        <Input
          id="game-name"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="e.g. Dark and Darker"
          required
        />
      </div>

      <div>
        <label htmlFor="game-slug" className="block text-sm font-medium text-white/70 mb-1">
          Slug <span className="text-white/30 font-normal">(auto-generated, editable)</span>
        </label>
        <Input
          id="game-slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
          placeholder="e.g. dark-and-darker"
          pattern="[a-z0-9-]+"
          required
        />
        <p className="text-xs text-white/30 mt-1">Used in URLs: /browse?game={slug || 'slug'}</p>
      </div>

      <Button type="submit" disabled={loading || !name.trim() || !slug.trim()}>
        {loading ? 'Adding…' : 'Add Game'}
      </Button>
    </form>
  )
}
