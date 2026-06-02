'use client'

import { createSupabaseBrowser } from '../../../../lib/supabase/client'
import { useState } from 'react'
import { Button } from '../../../../components/ui/button'
import { Input } from '../../../../components/ui/input'
import { useRouter } from 'next/navigation'

export default function SignInPage() {
  const supabase = createSupabaseBrowser()
  const router = useRouter()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [authMethod, setAuthMethod] = useState<'password' | 'magic-link'>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function handlePasswordAuth(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (error) throw error

        if (data?.user?.identities?.length === 0) {
          setError('An account with this email already exists')
        } else {
          setSent(true)
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        router.push('/dashboard')
        router.refresh()
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Authentication failed'
      if (err.message?.includes('fetch')) {
        setError('Network error: Cannot connect to authentication server.')
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      
      if (error) throw error
      setSent(true)
    } catch (err: any) {
      setError(err.message || 'Failed to send magic link')
    } finally {
      setLoading(false)
    }
  }

  const isPasswordValid = password.length >= 6

  return (
    <section className="relative overflow-hidden min-h-[calc(100vh-14rem)]">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand/10 via-transparent to-transparent" />
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(to right, rgb(255 255 255 / 0.05) 1px, transparent 1px),
                           linear-gradient(to bottom, rgb(255 255 255 / 0.05) 1px, transparent 1px)`,
          backgroundSize: '4rem 4rem'
        }} />
      </div>

      {/* Glowing orb */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand/20 rounded-full blur-3xl opacity-20" />

      <div className="container relative max-w-md py-16 sm:py-24">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm backdrop-blur-sm">
            <svg className="h-4 w-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Secure Authentication
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              {mode === 'signin' ? 'Sign In to Ratlist' : 'Create Your Account'}
            </span>
          </h1>
          
          <p className="text-white/60">
            {mode === 'signin' 
              ? 'Sign in to report incidents and access your account'
              : 'Join Ratlist to start reporting and tracking incidents'
            }
          </p>
        </div>

        {/* Sign-in/Sign-up card */}
        <div className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-8">
          <div className="space-y-6">
            {/* Mode toggle */}
            <div className="flex gap-2 p-1 bg-white/5 rounded-lg">
              <button
                onClick={() => {
                  setMode('signin')
                  setError(null)
                  setSent(false)
                }}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'signin' 
                    ? 'bg-brand text-white' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setMode('signup')
                  setError(null)
                  setSent(false)
                }}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'signup' 
                    ? 'bg-brand text-white' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Auth method toggle */}
            <div className="flex gap-2 text-xs">
              <button
                onClick={() => {
                  setAuthMethod('password')
                  setError(null)
                  setSent(false)
                }}
                className={`px-3 py-1.5 rounded transition-colors ${
                  authMethod === 'password'
                    ? 'bg-white/10 text-white'
                    : 'text-white/50 hover:text-white/70'
                }`}
              >
                Password
              </button>
              <button
                onClick={() => {
                  setAuthMethod('magic-link')
                  setError(null)
                  setSent(false)
                }}
                className={`px-3 py-1.5 rounded transition-colors ${
                  authMethod === 'magic-link'
                    ? 'bg-white/10 text-white'
                    : 'text-white/50 hover:text-white/70'
                }`}
              >
                Magic Link
              </button>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Success message for sign up */}
            {sent && mode === 'signup' && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm text-green-400">
                  Check your email to confirm your account!
                </p>
              </div>
            )}

            {/* Password form */}
            {authMethod === 'password' && !sent && (
              <form onSubmit={handlePasswordAuth} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white/80">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/5 border-white/10"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-white/80">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="bg-white/5 border-white/10"
                    disabled={loading}
                  />
                  {mode === 'signup' && password && (
                    <p className={`mt-1.5 text-xs ${isPasswordValid ? 'text-green-400' : 'text-white/50'}`}>
                      {isPasswordValid ? '✓ Password meets requirements' : 'Must be at least 6 characters'}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-brand hover:bg-brand/90"
                  disabled={loading || (mode === 'signup' && !isPasswordValid)}
                >
                  {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
                </Button>
              </form>
            )}

            {/* Magic link form */}
            {authMethod === 'magic-link' && (
              <div>
                <label className="block text-sm font-medium mb-2 text-white/80">
                  Email
                </label>
                <form onSubmit={handleMagicLink} className="flex items-center gap-2">
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/5 border-white/10"
                    disabled={loading}
                  />
                  <Button 
                    type="submit" 
                    className="bg-brand hover:bg-brand/90"
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : sent ? 'Sent ✓' : 'Send link'}
                  </Button>
                </form>
                {sent && (
                  <p className="mt-2 text-sm text-green-400">
                    Check your email for the sign-in link!
                  </p>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-center text-sm text-white/50">
          By signing in, you agree to our terms of service and privacy policy
        </p>
      </div>
    </section>
  )
}
