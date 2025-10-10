'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { trackSearch } from '@/lib/gtag'

interface SearchBarProps {
  onSearch: (query: string) => void
  initialQuery?: string
  resultsCount?: number
}

export default function SearchBar({ onSearch, initialQuery = '', resultsCount = 0 }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Track search in GA4
    trackSearch(query, resultsCount)
    onSearch(query)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          placeholder="Find your star..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-6 py-4 text-lg rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-900 hover:bg-blue-800 text-white p-2 rounded-lg transition-colors duration-200"
        >
          <Search size={24} />
        </button>
      </form>
    </div>
  )
}
