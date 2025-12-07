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
      console.log('🔐 Attempting authentication...')
      console.log('Mode:', mode)
      console.log('Email:', email)
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
      
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        
        if (error) {
          console.error('❌ Sign up error:', error)
          throw error
        }
        
        if (data?.user?.identities?.length === 0) {
          setError('An account with this email already exists')
        } else {
          console.log('✅ Sign up successful')
          setSent(true)
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (error) {
          console.error('❌ Sign in error:', error)
          throw error
        }
        
        console.log('✅ Sign in successful, redirecting...')
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err: any) {
      console.error('💥 Auth error:', err)
      const errorMessage = err.message || 'Authentication failed'
      setError(errorMessage)
      
      // Additional diagnostic info
      if (err.message?.includes('fetch')) {
        setError('Network error: Cannot connect to authentication server. Check if Supabase is running.')
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

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white/5 text-white/60">Or continue with</span>
              </div>
            </div>

            {/* OAuth buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="border-white/10 bg-white/5 hover:bg-white/10"
                onClick={() =>
                  supabase.auth.signInWithOAuth({
                    provider: 'github',
                    options: { redirectTo: `${window.location.origin}/auth/callback` },
                  })
                }
              >
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </Button>
              <Button
                variant="outline"
                className="border-white/10 bg-white/5 hover:bg-white/10"
                onClick={() =>
                  supabase.auth.signInWithOAuth({
                    provider: 'discord',
                    options: { redirectTo: `${window.location.origin}/auth/callback` },
                  })
                }
              >
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                Discord
              </Button>
            </div>
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
