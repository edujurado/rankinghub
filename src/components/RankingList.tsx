'use client'

import { useState } from 'react'
import { Star, CheckCircle, Flag, Eye, MessageCircle, BarChart3 } from 'lucide-react'
import { Provider } from '@/types'
import { getProvidersByCategory } from '@/lib/data'
import ProviderCard from './ProviderCard'

interface RankingListProps {
  category: string
  searchQuery?: string
}

export default function RankingList({ category, searchQuery }: RankingListProps) {
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'popularity'>('rating')
  const providers = getProvidersByCategory(category, searchQuery)

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
          Top {providers.length} {category.charAt(0).toUpperCase() + category.slice(1)}
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

      {/* Rankings List */}
      <div className="space-y-4">
        {providers.map((provider) => (
          <div key={provider.id} className="ranking-card">
            <div className="flex items-center space-x-6">
              {/* Position Number */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-black">
                    {provider.position}
                  </span>
                </div>
              </div>

              {/* Profile Image */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={provider.image}
                    alt={provider.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.name)}&background=random&color=fff&size=64`
                    }}
                  />
                </div>
              </div>

              {/* Provider Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {provider.name}
                  </h3>
                  {provider.verified && (
                    <CheckCircle size={20} className="text-blue-500 flex-shrink-0" />
                  )}
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Flag size={16} />
                    <span>{getCountryFlag(provider.country)} {provider.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {renderStars(provider.rating)}
                    <span className="ml-1">{provider.rating}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex-shrink-0 flex space-x-2">
                <button className="btn-primary text-sm px-4 py-2">
                  <Eye size={16} className="inline mr-1" />
                  View Profile
                </button>
                <button className="btn-secondary text-sm px-4 py-2">
                  <MessageCircle size={16} className="inline mr-1" />
                  Contact
                </button>
                <button className="btn-outline text-sm px-4 py-2">
                  <BarChart3 size={16} className="inline mr-1" />
                  Metrics
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
