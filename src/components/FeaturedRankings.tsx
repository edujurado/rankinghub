'use client'

import { useState, useEffect } from 'react'
import { Star, CheckCircle, Flag, Eye, MessageCircle, BarChart3, Award, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { getProvidersByCategory } from '@/lib/database'
import type { Provider } from '@/lib/database'

export default function FeaturedRankings() {
  const [topDjs, setTopDjs] = useState<Provider[]>([])
  const [topPhotographers, setTopPhotographers] = useState<Provider[]>([])
  const [topVideographers, setTopVideographers] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<'djs' | 'photographers' | 'videographers'>('djs')

  useEffect(() => {
    const fetchTopProviders = async () => {
      setLoading(true)
      try {
        const [djs, photographers, videographers] = await Promise.all([
          getProvidersByCategory('djs', undefined, 'rating', 5),
          getProvidersByCategory('photographers', undefined, 'rating', 5),
          getProvidersByCategory('videographers', undefined, 'rating', 5)
        ])
        setTopDjs(djs)
        setTopPhotographers(photographers)
        setTopVideographers(videographers)
      } catch (error) {
        console.error('Error fetching top providers:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTopProviders()
  }, [])

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

  const getCurrentProviders = () => {
    switch (activeCategory) {
      case 'djs': return topDjs
      case 'photographers': return topPhotographers
      case 'videographers': return topVideographers
      default: return topDjs
    }
  }

  const getCategoryTitle = () => {
    switch (activeCategory) {
      case 'djs': return 'Ranking DJs'
      case 'photographers': return 'Ranking Photographers'
      case 'videographers': return 'Ranking Videographers'
      default: return 'Ranking DJs'
    }
  }

  const getCategoryIcon = () => {
    switch (activeCategory) {
      case 'djs': return '🎧'
      case 'photographers': return '📸'
      case 'videographers': return '🎥'
      default: return '🎧'
    }
  }

  return (
    <section className="py-16 bg-white/80 backdrop-blur-sm relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Award className="text-yellow-500 mr-2" size={32} />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Featured Rankings
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
            Discover the highest-rated event service providers in New York City, 
            ranked by client satisfaction, ratings, and performance metrics.
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
              RH-Score Algorithm
            </span>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
              Verified Data
            </span>
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-medium">
              Real-time Rankings
            </span>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-xl p-2 shadow-lg">
            <div className="flex space-x-2">
              {[
                { key: 'djs', label: 'DJs', icon: '🎧' },
                { key: 'photographers', label: 'Photographers', icon: '📸' },
                { key: 'videographers', label: 'Videographers', icon: '🎥' }
              ].map((category) => (
                <button
                  key={category.key}
                  onClick={() => setActiveCategory(category.key as any)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center ${
                    activeCategory === category.key
                      ? 'bg-yellow-400 text-black shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2 text-lg">{category.icon}</span>
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Rankings Display */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-3xl mr-3">{getCategoryIcon()}</span>
                <div>
                  <h3 className="text-2xl font-bold text-white">{getCategoryTitle()} in NYC</h3>
                  <p className="text-blue-100">Based on ratings, reviews, and client satisfaction</p>
                </div>
              </div>
              <div className="flex items-center text-white">
                <TrendingUp size={24} className="mr-2" />
                <span className="font-medium">Live Rankings</span>
              </div>
            </div>
          </div>

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

          <div className="p-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading rankings...</p>
              </div>
            ) : (
              <div className="space-y-0">
                {getCurrentProviders().map((provider, index) => (
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* View All Button */}
            <div className="text-center mt-8 pt-6 border-t border-gray-200">
              <Link 
                href="/rankings" 
                className="inline-flex items-center bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded-lg transition-colors duration-200"
              >
                <BarChart3 size={20} className="mr-2" />
                View All Rankings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
