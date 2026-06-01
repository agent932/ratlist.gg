'use client'

export default function IncidentError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="container py-24 text-center">
      <div className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-12 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-white/60 mb-2">Failed to load incident</h1>
        <p className="text-white/40 text-sm mb-6">{error.message || 'An unexpected error occurred'}</p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-brand hover:bg-brand/90 text-brand-foreground rounded-lg font-medium transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
