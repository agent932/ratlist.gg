'use client'

import { useEffect, useState } from 'react'

export default function DiagnosticPage() {
  const [config, setConfig] = useState<any>(null)
  const [pingResult, setPingResult] = useState<string>('')

  useEffect(() => {
    // Check environment variables
    setConfig({
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      keyPrefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20),
    })

    // Try to ping Supabase
    const pingSupabase = async () => {
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const response = await fetch(`${url}/rest/v1/`, {
          headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          },
        })
        setPingResult(`Status: ${response.status} ${response.statusText}`)
      } catch (err: any) {
        setPingResult(`Error: ${err.message}`)
      }
    }

    pingSupabase()
  }, [])

  return (
    <div className="container py-16">
      <h1 className="text-3xl font-bold mb-8">Supabase Diagnostic</h1>
      
      <div className="space-y-6">
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Environment Configuration</h2>
          <pre className="text-sm bg-black/20 p-4 rounded overflow-x-auto">
            {JSON.stringify(config, null, 2)}
          </pre>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Connectivity Test</h2>
          <p className="text-sm">
            {pingResult || 'Testing...'}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Browser Console</h2>
          <p className="text-sm text-white/60">
            Open your browser&apos;s developer console (F12) to see detailed network errors.
          </p>
        </div>
      </div>
    </div>
  )
}
