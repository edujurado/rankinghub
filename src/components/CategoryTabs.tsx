'use client'

import { useState, useEffect } from 'react'
import { getProvidersByCategory } from '@/lib/database'
import { trackCategoryFilter } from '@/lib/gtag'

interface CategoryTabsProps {
  activeCategory: string
  onCategoryChange: (category: string) => void
}

interface Category {
  id: string
  name: string
  count: number
}

export default function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
  const [categories, setCategories] = useState<Category[]>([
    { id: 'djs', name: 'DJs', count: 0 },
    { id: 'photographers', name: 'Photographers', count: 0 },
    { id: 'videographers', name: 'Videographers', count: 0 }
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        const [djs, photographers, videographers] = await Promise.all([
          getProvidersByCategory('djs'),
          getProvidersByCategory('photographers'),
          getProvidersByCategory('videographers')
        ])

        setCategories([
          { id: 'djs', name: 'DJs', count: djs.length },
          { id: 'photographers', name: 'Photographers', count: photographers.length },
          { id: 'videographers', name: 'Videographers', count: videographers.length }
        ])
      } catch (error) {
        console.error('Error fetching category counts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategoryCounts()
  }, [])

  const handleCategoryClick = (categoryId: string) => {
    // Track category filter in GA4
    trackCategoryFilter(categoryId)
    onCategoryChange(categoryId)
  }

  return (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => handleCategoryClick(category.id)}
          disabled={loading}
          className={`flex-1 py-3 px-4 rounded-md font-semibold transition-all duration-200 ${
            activeCategory === category.id
              ? 'bg-yellow-400 text-black shadow-md'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {category.name}
          <span className="ml-2 text-sm opacity-75">
            {loading ? '...' : `(${category.count})`}
          </span>
        </button>
      ))}
    </div>
  )
}
