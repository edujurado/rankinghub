'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'
import RankingList from './RankingList'
import CategoryTabs from './CategoryTabs'
import SearchBar from './SearchBar'

export default function RankingsPage() {
  const searchParams = useSearchParams()
  const [activeCategory, setActiveCategory] = useState('djs')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    
    if (category && ['djs', 'photographers', 'videographers'].includes(category)) {
      setActiveCategory(category)
    }
    
    if (search) {
      setSearchQuery(search)
    }
  }, [searchParams])

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category)
    // Update URL without page reload
    const url = new URL(window.location.href)
    url.searchParams.set('category', category)
    window.history.pushState({}, '', url.toString())
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // Update URL without page reload
    const url = new URL(window.location.href)
    if (query) {
      url.searchParams.set('search', query)
    } else {
      url.searchParams.delete('search')
    }
    window.history.pushState({}, '', url.toString())
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-blue-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              ⭐ OFFICIAL RANKING NYC
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              - MARCH 2024 -
            </p>
            
            <SearchBar onSearch={handleSearch} initialQuery={searchQuery} />
          </div>
        </section>

        {/* Category Tabs */}
        <section className="bg-white py-6 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <CategoryTabs 
              activeCategory={activeCategory} 
              onCategoryChange={handleCategoryChange}
            />
          </div>
        </section>

        {/* Rankings List */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <RankingList 
              category={activeCategory} 
              searchQuery={searchQuery}
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
