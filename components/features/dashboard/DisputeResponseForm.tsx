'use client'

import { useEffect, useState } from 'react'

interface DisputeResponseFormProps {
  incidentId: string
}

interface ExistingResponse {
  id: string
  body: string
  created_at: string
}

export function DisputeResponseForm({ incidentId }: DisputeResponseFormProps) {
  const [existing, setExisting] = useState<ExistingResponse | null | undefined>(undefined)
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetch(`/api/incidents/${incidentId}/respond`)
      .then((r) => r.json())
      .then((d) => setExisting(d.response ?? null))
      .catch(() => setExisting(null))
  }, [incidentId])

  const handleSubmit = async () => {
    if (body.trim().length < 10) {
      setError('Response must be at least 10 characters.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/incidents/${incidentId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: body.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to submit response.')
        return
      }
      setSubmitted(true)
      setExisting({ id: data.data.id, body: body.trim(), created_at: data.data.created_at })
    } catch {
      setError('Network error — please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Still loading existing response
  if (existing === undefined) return null

  // Already responded
  if (existing) {
    return (
      <div className="mt-3 pt-3 border-t border-white/10">
        <div className="flex items-center gap-2 mb-1.5">
          <svg className="h-3.5 w-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-xs font-medium text-blue-400">Your response</span>
          <span className="text-xs text-white/30 ml-auto">
            {new Date(existing.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
        <p className="text-sm text-white/70 leading-relaxed">{existing.body}</p>
      </div>
    )
  }

  // Show form
  return (
    <div className="mt-3 pt-3 border-t border-white/10">
      {submitted ? (
        <div className="flex items-center gap-2 text-sm text-green-400">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Response submitted
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-white/40">Dispute this report — your response will appear on the incident page.</p>
          <textarea
            className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand resize-none"
            rows={3}
            placeholder="Explain your side (min 10 characters)…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={500}
          />
          <div className="flex items-center justify-between gap-3">
            {error && <span className="text-xs text-red-400">{error}</span>}
            <span className="text-xs text-white/30 ml-auto">{body.length}/500</span>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-3 py-1.5 bg-brand hover:bg-brand/90 text-brand-foreground text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Submitting…' : 'Submit Response'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
