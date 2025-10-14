'use client'

import { useState, useEffect } from 'react'
import { Star, CheckCircle, Flag, Eye, MessageCircle, BarChart3 } from 'lucide-react'
import { getProvidersByCategory } from '@/lib/database'
import type { Provider } from '@/lib/database'

interface RankingListProps {
  category: string
  searchQuery?: string
}

export default function RankingList({ category, searchQuery }: RankingListProps) {
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'popularity'>('rating')
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true)
      const data = await getProvidersByCategory(category, searchQuery, sortBy)
      setProviders(data)
      setLoading(false)
    }
    fetchProviders()
  }, [category, searchQuery, sortBy])

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

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading providers...</p>
      </div>
    )
  }

  if (providers.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-2xl font-semibold text-gray-900 mb-4">
          No providers found
        </h3>
        <p className="text-gray-600">
          Try adjusting your search criteria or browse other categories.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Sorting Options */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Ranking {providers.length} {category.charAt(0).toUpperCase() + category.slice(1)}
        </h2>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'rating' | 'price' | 'popularity')}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="rating">Rating</option>
            <option value="price">Price</option>
            <option value="popularity">Popularity</option>
          </select>
        </div>
      </div>

      {/* Rankings Table */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50 px-8 py-4 border-b border-gray-200">
          <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-600">
            <div className="col-span-1">Position</div>
            <div className="col-span-2">Provider</div>
            <div className="col-span-2">Location</div>
            <div className="col-span-2">Rating</div>
            <div className="col-span-2">RH-Score</div>
            <div className="col-span-3">Actions</div>
          </div>
        </div>

        {/* Rankings List */}
        <div className="space-y-0">
          {providers.map((provider, index) => (
            <div key={provider.id} className={`grid grid-cols-12 gap-4 items-center py-6 px-8 border-b border-gray-100 hover:bg-gray-50 transition-all duration-200 ${
              index === 0 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200' : 
              index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
            }`}>
              {/* Position */}
              <div className="col-span-1">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    index === 0 ? 'bg-yellow-400' : 
                    index === 1 ? 'bg-gray-300' : 
                    index === 2 ? 'bg-orange-400' : 'bg-gray-200'
                  }`}>
                    <span className="text-lg font-bold text-black">
                      {index + 1}
                    </span>
                  </div>
                  <span className="text-xs text-gray-600 mt-1 font-medium">
                    Position #{index + 1}
                  </span>
                </div>
              </div>

              {/* Provider */}
              <div className="col-span-2">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={provider.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.name)}&background=random&color=fff&size=48`}
                      alt={provider.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {provider.name}
                      </h3>
                      {provider.verified && (
                        <CheckCircle size={16} className="text-blue-500 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="col-span-2">
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <Flag size={14} />
                  <span>{getCountryFlag(provider.country)} {provider.location}</span>
                </div>
              </div>

              {/* Rating */}
              <div className="col-span-2">
                <div className="flex items-center space-x-1">
                  {renderStars(provider.rating)}
                  <span className="text-sm font-medium text-gray-900">{provider.rating}</span>
                </div>
              </div>

              {/* RH-Score Placeholder */}
              <div className="col-span-2">
                <span className="inline-flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                  Powered by RH-Score (Phase 2)
                </span>
              </div>

              {/* Actions */}
              <div className="col-span-3">
                <div className="flex space-x-2">
                  <a 
                    href={`/providers/${provider.id}`}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black text-xs px-3 py-1 rounded font-medium transition-colors duration-200 flex items-center"
                  >
                    <Eye size={12} className="mr-1" />
                    View
                  </a>
                  <a 
                    href={`/providers/${provider.id}#contact`}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs px-3 py-1 rounded font-medium transition-colors duration-200 flex items-center"
                  >
                    <MessageCircle size={12} className="mr-1" />
                    Contact
                  </a>
                  <button className="bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs px-3 py-1 rounded font-medium transition-colors duration-200 flex items-center">
                    <BarChart3 size={12} className="mr-1" />
                    Metrics
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
