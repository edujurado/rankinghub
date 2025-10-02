'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import Link from 'next/link'

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to rankings page with search query
      window.location.href = `/rankings?search=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <section className="bg-gradient-to-br from-blue-900 to-blue-800 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Find the Top DJs, Photographers & Videographers in NYC
        </h1>
        <p className="text-xl md:text-2xl mb-12 text-blue-100">
          Discover the best event service providers in New York City
        </p>
        
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Find a DJ, photographer, or videographer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 text-lg rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-yellow-400 hover:bg-yellow-500 text-black p-2 rounded-lg transition-colors duration-200"
            >
              <Search size={24} />
            </button>
          </form>
        </div>

        {/* Quick Actions */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/rankings" className="btn-primary text-lg px-8 py-3">
            View Rankings
          </Link>
          <Link href="/contact" className="btn-outline text-lg px-8 py-3">
            Request a Quote
          </Link>
        </div>
      </div>
    </section>
  )
}
