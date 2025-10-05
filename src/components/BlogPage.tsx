'use client'

import { useState, useEffect } from 'react'
import Header from './Header'
import Footer from './Footer'
import Link from 'next/link'
import { Calendar, User, ArrowRight } from 'lucide-react'
import { getBlogPosts, getBlogPostsPaginated } from '@/lib/database'
import type { BlogPost } from '@/lib/database'

export default function BlogPage() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const postsPerPage = 6

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const posts = await getBlogPosts(postsPerPage) // Fetch initial posts
        setBlogPosts(posts)
        setHasMore(posts.length === postsPerPage)
      } catch (error) {
        console.error('Error fetching blog posts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBlogPosts()
  }, [])

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return

    setLoadingMore(true)
    try {
      const nextPage = currentPage + 1
      const offset = nextPage * postsPerPage
      const newPosts = await getBlogPostsPaginated(postsPerPage, offset)
      
      if (newPosts.length > 0) {
        setBlogPosts(prevPosts => [...prevPosts, ...newPosts])
        setCurrentPage(nextPage)
        setHasMore(newPosts.length === postsPerPage)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Error loading more posts:', error)
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-blue-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              RankingHub Blog
            </h1>
            <p className="text-xl md:text-2xl text-blue-100">
              Expert insights on NYC event services and industry trends
            </p>
          </div>
        </section>

        {/* Blog Posts */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading blog posts...</p>
              </div>
            ) : blogPosts.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  No blog posts found
                </h3>
                <p className="text-gray-600">
                  Check back soon for new articles and insights.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogPosts.map((post) => (
                <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={post.featured_image || '/api/placeholder/400/300'}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <span className="flex items-center">
                        <Calendar size={16} className="mr-1" />
                        {post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Recently'}
                      </span>
                      <span className="flex items-center">
                        <User size={16} className="mr-1" />
                        {post.author_name || 'RankingHub Team'}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {post.title}
                    </h2>

                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt || 'Read more about this topic...'}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {post.tags && post.tags.length > 0 ? (
                          post.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {post.category || 'General'}
                          </span>
                        )}
                      </div>
                      
                      <Link
                        href={`/blog/${post.slug}`}
                        className="flex items-center text-yellow-600 hover:text-yellow-700 font-medium"
                      >
                        Read More
                        <ArrowRight size={16} className="ml-1" />
                      </Link>
                    </div>
                  </div>
                </article>
                ))}
              </div>
            )}

            {/* Load More Button */}
            {blogPosts.length > 0 && hasMore && (
              <div className="text-center mt-12">
                <button 
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className={`btn-primary ${loadingMore ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                      Loading...
                    </>
                  ) : (
                    'Load More Articles'
                  )}
                </button>
              </div>
            )}

            {/* No More Articles Message */}
            {blogPosts.length > 0 && !hasMore && (
              <div className="text-center mt-12">
                <p className="text-gray-600">You've reached the end of our articles!</p>
              </div>
            )}
          </div>
        </section>

        {/* SEO Content */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Your Guide to NYC Event Services
              </h2>
              <p className="text-xl text-gray-600">
                Expert insights, industry trends, and comprehensive guides to help you find the perfect event service providers in New York City.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎵</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">DJ Services</h3>
                <p className="text-gray-600">
                  Find the best DJs for weddings, corporate events, and parties in NYC.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📸</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Photography</h3>
                <p className="text-gray-600">
                  Professional photographers for all types of events and occasions.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎥</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Videography</h3>
                <p className="text-gray-600">
                  Expert videographers to capture your special moments in NYC.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
