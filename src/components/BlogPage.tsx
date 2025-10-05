import Header from './Header'
import Footer from './Footer'
import Link from 'next/link'
import { Calendar, User, ArrowRight } from 'lucide-react'

export default function BlogPage() {
  // Mock blog posts - in real app, fetch from database
  const blogPosts = [
    {
      id: '1',
      title: 'Top 10 DJs in NYC for 2024',
      slug: 'top-10-djs-nyc-2024',
      excerpt: 'Discover the best DJs in New York City for your next event. Our comprehensive ranking features top-rated DJs with verified reviews.',
      featured_image: '/blog/djs-2024.jpg',
      author_name: 'RankingHub Team',
      published_at: '2024-01-15',
      category: 'DJs',
      tags: ['DJs', 'NYC', 'Events', 'Music'],
      view_count: 1250
    },
    {
      id: '2',
      title: 'Best Event Photographers in NYC',
      slug: 'best-event-photographers-nyc',
      excerpt: 'Professional photographers for weddings, corporate events, and special occasions. Find the perfect photographer for your event.',
      featured_image: '/blog/photographers-2024.jpg',
      author_name: 'RankingHub Team',
      published_at: '2024-01-10',
      category: 'Photography',
      tags: ['Photography', 'Events', 'Weddings', 'NYC'],
      view_count: 980
    },
    {
      id: '3',
      title: 'Ultimate Guide to Event Videography in NYC',
      slug: 'event-videography-guide-nyc',
      excerpt: 'Everything you need to know about hiring a videographer for your NYC event. Tips, costs, and our top recommendations.',
      featured_image: '/blog/videography-guide.jpg',
      author_name: 'RankingHub Team',
      published_at: '2024-01-05',
      category: 'Videography',
      tags: ['Videography', 'Events', 'NYC', 'Guide'],
      view_count: 750
    },
    {
      id: '4',
      title: 'How to Choose the Right DJ for Your Wedding',
      slug: 'choose-right-dj-wedding',
      excerpt: 'Essential tips for selecting the perfect DJ for your wedding day. Music selection, equipment, and what to ask.',
      featured_image: '/blog/wedding-dj-guide.jpg',
      author_name: 'RankingHub Team',
      published_at: '2024-01-01',
      category: 'Weddings',
      tags: ['Weddings', 'DJs', 'Music', 'Planning'],
      view_count: 650
    }
  ]

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
                        {new Date(post.published_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <User size={16} className="mr-1" />
                        {post.author_name}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {post.title}
                    </h2>

                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {post.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
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

            {/* Load More Button */}
            <div className="text-center mt-12">
              <button className="btn-primary">
                Load More Articles
              </button>
            </div>
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
