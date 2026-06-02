'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { validateEmbarkID, EMBARK_ID_GAMES } from '@/lib/validation/player-id'
import { TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  cheating: 'Using hacks, aimbots, wall hacks, or any third-party software to gain an unfair advantage.',
  scamming: 'Deceiving another player for in-game items, currency, or services.',
  betrayal: 'Killing or harming teammates without justification in a co-op or squad context.',
  griefing: 'Intentionally disrupting another player\'s experience without competitive reason.',
  'stream-sniping': 'Watching a streamer\'s broadcast to gain information about their in-game location.',
  'extract-camping': 'Waiting at extraction points specifically to kill players who are trying to leave.',
  'team-violation': 'Breaking team rules, friendly fire, or other violations of squad conduct.',
  toxicity: 'Verbal abuse, hate speech, or sustained harassment in chat or voice.',
  teaming: 'Coordinating with enemy players in a solo/FFA mode for mutual benefit.',
  'friendly-fire': 'Repeatedly shooting or damaging teammates in a way that is clearly intentional.',
  'clutch-save': 'Exceptional positive play — saving a teammate or the team from a difficult situation.',
  helpful: 'Going out of their way to assist other players, share resources, or improve the experience.',
}

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

      <fieldset>
        <legend className="block text-sm font-medium mb-2">Incident category <span className="text-red-400">*</span></legend>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" role="radiogroup" aria-required="true">
          {categories.map((c) => {
            const desc = CATEGORY_DESCRIPTIONS[c.slug]
            return (
              <TooltipProvider key={c.id} delayDuration={300}>
                <TooltipRoot>
                  <TooltipTrigger asChild>
                    <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 cursor-pointer hover:bg-white/5 hover:border-white/20 transition-colors has-[:checked]:border-brand/60 has-[:checked]:bg-brand/10">
                      <input
                        type="radio"
                        name="category_id"
                        value={c.id}
                        required
                        className="accent-brand shrink-0"
                      />
                      <span className="text-sm text-white/80 leading-tight">{c.label}</span>
                      {desc && (
                        <svg className="h-3.5 w-3.5 text-white/30 shrink-0 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </label>
                  </TooltipTrigger>
                  {desc && (
                    <TooltipContent side="top" className="max-w-xs">
                      {desc}
                    </TooltipContent>
                  )}
                </TooltipRoot>
              </TooltipProvider>
            )
          })}
        </div>
      </fieldset>

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
