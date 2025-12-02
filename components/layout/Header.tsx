'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

type UserRole = 'user' | 'moderator' | 'admin'

export function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<UserRole>('user')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createSupabaseBrowser()

  useEffect(() => {
    async function loadUser() {
      try {
        // Check both session and user for most reliable state
        const { data: { session } } = await supabase.auth.getSession()
        const currentUser = session?.user ?? null
        
        setUser(currentUser)
        
        if (currentUser) {
          // Fetch user role from profile
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('user_id', currentUser.id)
            .single()
          
          if (profile?.role) {
            setUserRole(profile.role as UserRole)
          }
        } else {
          // Reset role when user signs out
          setUserRole('user')
        }
      } finally {
        setIsLoading(false)
      }
    }
    
    loadUser()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        // Immediately update user state and fetch role
        const currentUser = session?.user ?? null
        setUser(currentUser)
        
        if (currentUser) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('user_id', currentUser.id)
            .single()
          
          if (profile?.role) {
            setUserRole(profile.role as UserRole)
          }
        }
        
        // Close mobile menu when user signs in
        setMobileMenuOpen(false)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setUserRole('user')
        setMobileMenuOpen(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  // Refetch auth state when page becomes visible (handles mobile browser tab switching)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden) {
        const { data: { session } } = await supabase.auth.getSession()
        const currentUser = session?.user ?? null
        
        if (currentUser !== user) {
          console.log('Visibility change detected user state change')
          setUser(currentUser)
          
          if (currentUser) {
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('role')
              .eq('user_id', currentUser.id)
              .single()
            
            if (profile?.role) {
              setUserRole(profile.role as UserRole)
            }
          } else {
            setUserRole('user')
          }
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [supabase, user])

  // Listen for storage events (cross-tab auth changes)
  useEffect(() => {
    const handleStorageChange = async (e: StorageEvent) => {
      if (e.key?.includes('supabase.auth.token')) {
        console.log('Storage event detected - auth token changed')
        const { data: { session } } = await supabase.auth.getSession()
        const currentUser = session?.user ?? null
        
        setUser(currentUser)
        
        if (currentUser) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('user_id', currentUser.id)
            .single()
          
          if (profile?.role) {
            setUserRole(profile.role as UserRole)
          }
        } else {
          setUserRole('user')
        }
        
        setMobileMenuOpen(false)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [supabase])

  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <div className="absolute inset-0 bg-brand/20 blur-lg group-hover:bg-brand/30 transition-all" />
            <svg className="relative h-8 w-8 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Ratlist.gg
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          <a 
            href="/browse" 
            className="px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors"
          >
            Browse
          </a>
          <a 
            href="/games" 
            className="px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors"
          >
            Games
          </a>
          <a 
            href="/faq" 
            className="px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors"
          >
            FAQ
          </a>
          
          {/* Dashboard Link (for logged-in users) */}
          {user && (
            <a 
              href="/dashboard" 
              className="px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors"
            >
              Dashboard
            </a>
          )}
          
          {/* Admin/Moderator Links */}
          {user && (userRole === 'moderator' || userRole === 'admin') && (
            <>
              <div className="ml-2 h-6 w-px bg-white/10" aria-hidden="true" />
              <a 
                href="/moderator/flags" 
                className="px-4 py-2 rounded-lg text-sm font-medium text-amber-400/80 hover:text-amber-400 hover:bg-amber-400/5 transition-colors"
                aria-label="Moderator flags queue"
              >
                Flags
              </a>
              {userRole === 'admin' && (
                <>
                  <a 
                    href="/admin/dashboard" 
                    className="px-4 py-2 rounded-lg text-sm font-medium text-purple-400/80 hover:text-purple-400 hover:bg-purple-400/5 transition-colors"
                    aria-label="Admin dashboard"
                  >
                    Dashboard
                  </a>
                  <a 
                    href="/admin/audit" 
                    className="px-4 py-2 rounded-lg text-sm font-medium text-purple-400/80 hover:text-purple-400 hover:bg-purple-400/5 transition-colors"
                    aria-label="Admin audit logs"
                  >
                    Audit
                  </a>
                </>
              )}
            </>
          )}
          
          <div className="ml-2 h-6 w-px bg-white/10" aria-hidden="true" />
          
          {user ? (
            <div className="ml-2 flex items-center gap-2">
              <a 
                href="/report" 
                className="px-4 py-2 rounded-lg bg-brand hover:bg-brand/90 text-brand-foreground text-sm font-semibold transition-colors"
                aria-label="Submit an incident report"
              >
                Report
              </a>
              <button
                onClick={signOut}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Sign out of your account"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="ml-2 flex items-center gap-2">
              <a 
                href="/auth/sign-in" 
                className="px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors"
              >
                Sign In
              </a>
              <a 
                href="/report" 
                className="px-4 py-2 rounded-lg bg-brand hover:bg-brand/90 text-brand-foreground text-sm font-semibold transition-colors"
                aria-label="Submit an incident report"
              >
                Report
              </a>
            </div>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-black/95 backdrop-blur-xl">
          <nav className="container py-4 flex flex-col gap-2">
            <a 
              href="/browse" 
              className="px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors"
            >
              Browse
            </a>
            <a 
              href="/games" 
              className="px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors"
            >
              Games
            </a>
            <a 
              href="/faq" 
              className="px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors"
            >
              FAQ
            </a>
            
            {/* Dashboard Link Mobile */}
            {user && (
              <a 
                href="/dashboard" 
                className="px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors"
              >
                Dashboard
              </a>
            )}
            
            {/* Admin/Moderator Links Mobile */}
            {user && (userRole === 'moderator' || userRole === 'admin') && (
              <>
                <div className="my-2 h-px bg-white/10" />
                <div className="px-2 text-xs font-semibold text-white/40 uppercase tracking-wider">
                  {userRole === 'admin' ? 'Admin' : 'Moderator'}
                </div>
                <a 
                  href="/moderator/flags" 
                  className="px-4 py-2 rounded-lg text-sm font-medium text-amber-400/80 hover:text-amber-400 hover:bg-amber-400/5 transition-colors"
                >
                  Review Flags
                </a>
                {userRole === 'admin' && (
                  <>
                    <a 
                      href="/admin/dashboard" 
                      className="px-4 py-2 rounded-lg text-sm font-medium text-purple-400/80 hover:text-purple-400 hover:bg-purple-400/5 transition-colors"
                    >
                      Admin Dashboard
                    </a>
                    <a 
                      href="/admin/audit" 
                      className="px-4 py-2 rounded-lg text-sm font-medium text-purple-400/80 hover:text-purple-400 hover:bg-purple-400/5 transition-colors"
                    >
                      Audit Logs
                    </a>
                  </>
                )}
              </>
            )}
            
            <div className="my-2 h-px bg-white/10" />
            
            {user ? (
              <>
                <a 
                  href="/report" 
                  className="px-4 py-2 rounded-lg bg-brand hover:bg-brand/90 text-brand-foreground text-sm font-semibold transition-colors text-center"
                >
                  Report Incident
                </a>
                <button
                  onClick={signOut}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors text-left"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <a 
                  href="/auth/sign-in" 
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Sign In
                </a>
                <a 
                  href="/report" 
                  className="px-4 py-2 rounded-lg bg-brand hover:bg-brand/90 text-brand-foreground text-sm font-semibold transition-colors text-center"
                >
                  Report Incident
                </a>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
