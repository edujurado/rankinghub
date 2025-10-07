'use client'

import { useState, useEffect } from 'react'
import { Search, Star, CheckCircle, Flag, Eye, MessageCircle, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { getProvidersByCategory } from '@/lib/database'
import type { Provider } from '@/lib/database'

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState('')
  const [topProviders, setTopProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTopProviders = async () => {
      setLoading(true)
      try {
        // Get top 3 DJs for the hero section
        const djs = await getProvidersByCategory('djs', undefined, 'rating', 3)
        setTopProviders(djs)
      } catch (error) {
        console.error('Error fetching top providers:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTopProviders()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to rankings page with search query
      window.location.href = `/rankings?search=${encodeURIComponent(searchQuery)}`
    }
  }

  const getCountryFlag = (country: string) => {
    const flags: { [key: string]: string } = {
      'USA': '🇺🇸',
      'Brazil': '🇧🇷',
      'Mexico': '🇲🇽',
      'Canada': '🇨🇦',
      'UK': '🇬🇧'
    }
    return flags[country] || '🌍'
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
      />
    ))
  }

  return (
    <section className="bg-gradient-to-br from-blue-900 to-blue-800 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Star className="text-yellow-400 mr-2" size={32} />
            <h1 className="text-3xl md:text-5xl font-bold">
              Official DJ Ranking NYC
            </h1>
          </div>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Discover the best event service providers in New York City
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/rankings" className="btn-primary text-lg px-8 py-3">
              View Full Ranking
            </Link>
            <Link href="/contact" className="btn-outline text-lg px-8 py-3">
              Request a Quote
            </Link>
          </div>
        </div>

        {/* Top Rankings Preview */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Top 3 DJs in NYC</h2>
            <p className="text-blue-200">Based on ratings, reviews, and client satisfaction</p>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
              <p className="mt-4 text-blue-200">Loading top DJs...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topProviders.map((provider, index) => (
                <div key={provider.id} className="bg-white/20 backdrop-blur-sm rounded-xl p-6 hover:bg-white/30 transition-all duration-200">
                  <div className="flex items-center space-x-6">
                    {/* Position Number */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                        <span className="text-xl font-bold text-black">
                          {index + 1}
                        </span>
                      </div>
                    </div>

                    {/* Profile Image */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={provider.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.name)}&background=random&color=fff&size=64`}
                          alt={provider.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Provider Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-white truncate">
                          {provider.name}
                        </h3>
                        {provider.verified && (
                          <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-blue-200">
                        <div className="flex items-center space-x-1">
                          <Flag size={16} />
                          <span>{getCountryFlag(provider.country)} {provider.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {renderStars(provider.rating)}
                          <span className="ml-1 text-white font-medium">{provider.rating}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex-shrink-0 flex space-x-2">
                      <a 
                        href={`/providers/${provider.id}`}
                        className="bg-yellow-400 hover:bg-yellow-500 text-black text-sm px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center"
                      >
                        <Eye size={16} className="mr-1" />
                        View Profile
                      </a>
                      <a 
                        href={`/providers/${provider.id}#contact`}
                        className="bg-white/20 hover:bg-white/30 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center"
                      >
                        <MessageCircle size={16} className="mr-1" />
                        Contact
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* View More Button */}
          <div className="text-center mt-8">
            <Link 
              href="/rankings" 
              className="inline-flex items-center bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              <BarChart3 size={20} className="mr-2" />
              View Complete Rankings
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
