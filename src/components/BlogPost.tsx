'use client'

import { useState, useEffect } from 'react'
import Header from './Header'
import Footer from './Footer'
import Link from 'next/link'
import { Calendar, User, ArrowLeft, Share2, BookOpen } from 'lucide-react'
import { getBlogPostBySlug } from '@/lib/database'
import type { BlogPost } from '@/lib/database'

interface BlogPostProps {
  slug: string
}

export default function BlogPost({ slug }: BlogPostProps) {
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        const post = await getBlogPostBySlug(slug)
        setBlogPost(post)
      } catch (error) {
        console.error('Error fetching blog post:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBlogPost()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading blog post...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!blogPost) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Blog Post Not Found</h1>
            <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist or has been removed.</p>
            <Link href="/blog" className="btn-primary">
              <ArrowLeft size={16} className="inline mr-2" />
              Back to Blog
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main>
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center space-x-2 text-sm">
              <Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link>
              <span className="text-gray-400">/</span>
              <Link href="/blog" className="text-gray-500 hover:text-gray-700">Blog</Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900">{blogPost.title}</span>
            </nav>
          </div>
        </div>

        {/* Article Header */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <Link 
              href="/blog" 
              className="inline-flex items-center text-yellow-600 hover:text-yellow-700 mb-4"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Blog
            </Link>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {blogPost.title}
            </h1>
            
            <div className="flex items-center space-x-6 text-gray-600 mb-6">
              <div className="flex items-center">
                <Calendar size={20} className="mr-2" />
                {blogPost.published_at ? new Date(blogPost.published_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Recently'}
              </div>
              <div className="flex items-center">
                <User size={20} className="mr-2" />
                {blogPost.author_name}
              </div>
              <div className="flex items-center">
                <BookOpen size={20} className="mr-2" />
                {blogPost.view_count} views
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {blogPost.tags && blogPost.tags.length > 0 ? (
                blogPost.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                  {blogPost.category || 'General'}
                </span>
              )}
            </div>
          </div>

          {/* Featured Image */}
          <div className="mb-8">
            <img
              src={blogPost.featured_image || '/api/placeholder/800/400'}
              alt={blogPost.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg"
            />
          </div>

          {/* Article Content */}
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: blogPost.content }}
          />

          {/* Share Buttons */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Share this article</h3>
                <div className="flex space-x-4">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Share2 size={16} />
                    <span>Share</span>
                  </button>
                </div>
              </div>
              
              <div className="text-sm text-gray-500">
                Last updated: {blogPost.published_at ? new Date(blogPost.published_at).toLocaleDateString() : 'Recently'}
              </div>
            </div>
          </div>
        </article>

        {/* Related Articles */}
        <section className="bg-gray-100 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Related Articles
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <img
                  src="/blog/photographers-2024.jpg"
                  alt="Best Event Photographers"
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Best Event Photographers in NYC
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Professional photographers for weddings, corporate events, and special occasions.
                  </p>
                  <Link href="/blog/best-event-photographers-nyc" className="text-yellow-600 hover:text-yellow-700 font-medium">
                    Read More →
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <img
                  src="/blog/videography-guide.jpg"
                  alt="Event Videography Guide"
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Ultimate Guide to Event Videography
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Everything you need to know about hiring a videographer for your NYC event.
                  </p>
                  <Link href="/blog/event-videography-guide-nyc" className="text-yellow-600 hover:text-yellow-700 font-medium">
                    Read More →
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <img
                  src="/blog/wedding-dj-guide.jpg"
                  alt="Wedding DJ Guide"
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    How to Choose the Right DJ for Your Wedding
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Essential tips for selecting the perfect DJ for your wedding day.
                  </p>
                  <Link href="/blog/choose-right-dj-wedding" className="text-yellow-600 hover:text-yellow-700 font-medium">
                    Read More →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
