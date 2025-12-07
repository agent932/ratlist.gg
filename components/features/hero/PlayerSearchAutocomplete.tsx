'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'

interface PlayerSuggestion {
  identifier: string
  display_name: string | null
  incident_count: number
}

export function PlayerSearchAutocomplete() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<PlayerSuggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([])
        setIsOpen(false)
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/players/search?q=${encodeURIComponent(query)}`)
        if (response.ok) {
          const data = await response.json()
          setSuggestions(data)
          setIsOpen(data.length > 0)
        }
      } catch (error) {
        console.error('Failed to fetch suggestions:', error)
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(debounceTimer)
  }, [query])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      window.location.href = `/player/tarkov/${encodeURIComponent(query.trim())}`
    }
  }

  const handleSuggestionClick = (identifier: string) => {
    setQuery(identifier)
    setIsOpen(false)
    // Identifier is already redacted from API, use it directly
    window.location.href = `/player/tarkov/${encodeURIComponent(identifier)}`
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex].identifier)
        } else {
          handleSubmit(e)
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        break
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex flex-col sm:flex-row max-w-2xl items-stretch gap-3">
      <div className="relative flex-1" ref={wrapperRef}>
        <svg 
          className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 pointer-events-none z-10" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <Input 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search player by identifier..." 
          autoComplete="off"
          className="pl-12 h-14 bg-white/5 border-white/10 backdrop-blur-sm text-base sm:text-lg w-full"
        />
        
        {/* Autocomplete dropdown */}
        {isOpen && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl max-h-80 overflow-y-auto z-50">
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.identifier}
                type="button"
                onClick={() => handleSuggestionClick(suggestion.identifier)}
                className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0 ${
                  index === selectedIndex ? 'bg-white/10' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white truncate">
                      {suggestion.display_name || suggestion.identifier}
                    </div>
                    {suggestion.display_name && (
                      <div className="text-sm text-white/50 truncate">
                        {suggestion.identifier}
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <span className="text-xs px-2 py-1 rounded-full bg-brand/20 text-brand font-medium">
                      {suggestion.incident_count} {suggestion.incident_count === 1 ? 'report' : 'reports'}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && query.length >= 2 && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="h-5 w-5 border-2 border-white/20 border-t-brand rounded-full animate-spin" />
          </div>
        )}
      </div>
      
      <button 
        className="h-14 rounded-lg bg-brand px-8 font-semibold text-brand-foreground hover:bg-brand/90 transition-colors whitespace-nowrap" 
        type="submit"
      >
        Search
      </button>
    </form>
  )
}
