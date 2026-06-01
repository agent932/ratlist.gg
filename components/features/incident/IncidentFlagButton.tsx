'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export function IncidentFlagButton({ incidentId }: { incidentId: string }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    if (reason.trim().length < 10) {
      setError('Please provide at least 10 characters.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incident_id: incidentId, reason: reason.trim() }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error || 'Failed to submit flag.')
        return
      }
      setDone(true)
      setOpen(false)
    } catch {
      setError('Network error — please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <span className="text-sm text-green-400 flex items-center gap-1">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Flag submitted
      </span>
    )
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="border-white/20 text-white/70 hover:text-white hover:border-white/40"
        onClick={() => setOpen(true)}
      >
        <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
        </svg>
        Flag Report
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="bg-gray-900 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Flag this incident</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Explain why this report should be reviewed by a moderator.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-2">
            <textarea
              className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand resize-none"
              rows={4}
              placeholder="Reason for flagging (min 10 characters)…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
            />
            <div className="flex justify-between mt-1">
              {error && <span className="text-xs text-red-400">{error}</span>}
              <span className="text-xs text-white/30 ml-auto">{reason.length}/500</span>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 text-white border-white/20">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={submit} disabled={loading}>
              {loading ? 'Submitting…' : 'Submit Flag'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
