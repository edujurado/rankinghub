import Header from './Header'
import Footer from './Footer'
import Link from 'next/link'
import { Calendar, User, ArrowLeft, Share2, BookOpen } from 'lucide-react'

interface BlogPostProps {
  slug: string
}

export default function BlogPost({ slug }: BlogPostProps) {
  // Mock blog post data - in real app, fetch from database
  const blogPost = {
    id: '1',
    title: 'Top 10 DJs in NYC for 2024',
    slug: 'top-10-djs-nyc-2024',
    content: `
      <h2>Discover the Best DJs in New York City</h2>
      <p>New York City is home to some of the most talented DJs in the world. Whether you're planning a wedding, corporate event, or birthday party, finding the right DJ can make or break your event.</p>
      
      <h3>What Makes a Great DJ?</h3>
      <p>A great DJ doesn't just play music – they read the crowd, create energy, and ensure everyone has a memorable time. Here are the key qualities to look for:</p>
      
      <ul>
        <li><strong>Experience:</strong> Years of experience in various event types</li>
        <li><strong>Music Knowledge:</strong> Deep understanding of different genres and eras</li>
        <li><strong>Equipment:</strong> Professional-grade sound and lighting equipment</li>
        <li><strong>Personality:</strong> Ability to engage with guests and create atmosphere</li>
        <li><strong>Reliability:</strong> Punctual, professional, and dependable</li>
      </ul>
      
      <h3>Our Top 10 DJs in NYC for 2024</h3>
      <p>After extensive research and client feedback, we've compiled our list of the top 10 DJs in New York City for 2024. These professionals have consistently delivered exceptional performances and received outstanding reviews.</p>
      
      <h4>1. Chris Evans</h4>
      <p>With over 10 years of experience in NYC nightlife, Chris Evans is known for his versatility and ability to read any crowd. His professional equipment and seamless mixing make him a top choice for high-end events.</p>
      
      <h4>2. Lucas Pereira</h4>
      <p>Brazilian DJ Lucas Pereira brings international flair to NYC events. Specializing in Latin music and international events, he's perfect for diverse, multicultural celebrations.</p>
      
      <h4>3. Juan Martinez</h4>
      <p>Versatile and experienced, Juan Martinez excels in multiple genres. His expertise spans from corporate events to wild dance parties, making him adaptable to any event type.</p>
      
      <h3>How to Choose the Right DJ</h3>
      <p>When selecting a DJ for your event, consider these factors:</p>
      
      <ol>
        <li><strong>Event Type:</strong> Different events require different music styles and energy levels</li>
        <li><strong>Venue:</strong> Ensure the DJ has experience with your venue type and size</li>
        <li><strong>Budget:</strong> DJ prices vary significantly based on experience and equipment</li>
        <li><strong>Music Preferences:</strong> Discuss your musical preferences and any must-play songs</li>
        <li><strong>References:</strong> Ask for references from previous clients</li>
      </ol>
      
      <h3>Pricing Guide</h3>
      <p>DJ pricing in NYC typically ranges from $500 to $3,000+ depending on experience, equipment, and event duration. Here's a general breakdown:</p>
      
      <ul>
        <li><strong>Budget DJs:</strong> $500-$1,000 (newer DJs, basic equipment)</li>
        <li><strong>Mid-range DJs:</strong> $1,000-$2,000 (experienced, good equipment)</li>
        <li><strong>Premium DJs:</strong> $2,000+ (top-tier, professional equipment)</li>
      </ul>
      
      <h3>Conclusion</h3>
      <p>Choosing the right DJ is crucial for your event's success. Take time to research, read reviews, and meet with potential DJs to ensure they're the right fit for your event and budget.</p>
    `,
    featured_image: '/blog/djs-2024.jpg',
    author_name: 'RankingHub Team',
    published_at: '2024-01-15',
    category: 'DJs',
    tags: ['DJs', 'NYC', 'Events', 'Music'],
    meta_title: 'Top 10 DJs in NYC for 2024 | RankingHub',
    meta_description: 'Find the best DJs in New York City for your event. Our comprehensive ranking features top-rated DJs with verified reviews.',
    view_count: 1250
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
                {new Date(blogPost.published_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
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
              {blogPost.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Featured Image */}
          <div className="mb-8">
            <img
              src={blogPost.featured_image}
              alt={blogPost.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = '/api/placeholder/800/400'
              }}
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
                Last updated: {new Date(blogPost.published_at).toLocaleDateString()}
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
