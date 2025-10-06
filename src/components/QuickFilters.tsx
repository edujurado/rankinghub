import Link from 'next/link'
import { Music, Camera, Video, Star, Shield, Users, Award } from 'lucide-react'

export default function QuickFilters() {
  const categories = [
    {
      name: 'DJs',
      icon: Music,
      href: '/rankings?category=djs',
      description: 'Top-rated DJs for your events',
      color: 'bg-purple-500',
      stats: '150+ Verified DJs',
      rating: '4.8/5'
    },
    {
      name: 'Photographers',
      icon: Camera,
      href: '/rankings?category=photographers',
      description: 'Professional event photographers',
      color: 'bg-blue-500',
      stats: '120+ Verified Photographers',
      rating: '4.9/5'
    },
    {
      name: 'Videographers',
      icon: Video,
      href: '/rankings?category=videographers',
      description: 'Expert video production services',
      color: 'bg-green-500',
      stats: '80+ Verified Videographers',
      rating: '4.7/5'
    }
  ]

  const trustIndicators = [
    { icon: Shield, text: 'Verified Providers', count: '350+' },
    { icon: Star, text: 'Client Reviews', count: '2,500+' },
    { icon: Users, text: 'Happy Clients', count: '1,200+' },
    { icon: Award, text: 'Awards Won', count: '50+' }
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Indicators */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 mb-12 text-white">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by Event Organizers
            </h2>
            <p className="text-xl text-blue-100">
              Join thousands of satisfied clients who found their perfect service providers
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustIndicators.map((indicator, index) => {
              const IconComponent = indicator.icon
              return (
                <div key={index} className="text-center">
                  <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <IconComponent size={24} className="text-white" />
                  </div>
                  <div className="text-2xl font-bold">{indicator.count}</div>
                  <div className="text-blue-200 text-sm">{indicator.text}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Category Selection */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Browse by Category
          </h2>
          <p className="text-xl text-gray-600">
            Find the perfect service provider for your event
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category) => {
            const IconComponent = category.icon
            return (
              <Link
                key={category.name}
                href={category.href}
                className="group card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="text-center">
                  <div className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent size={32} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {category.description}
                  </p>
                  
                  {/* Stats */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                      <Star size={16} className="text-yellow-400" />
                      <span className="font-medium">{category.rating} Average Rating</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {category.stats}
                    </div>
                  </div>
                  
                  <div className="text-yellow-400 font-semibold group-hover:text-yellow-500">
                    View Rankings →
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-gray-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Find Your Perfect Match?
            </h3>
            <p className="text-gray-600 mb-6">
              Browse our comprehensive rankings and connect with the best service providers in NYC
            </p>
            <Link 
              href="/rankings" 
              className="inline-flex items-center bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              <Award size={20} className="mr-2" />
              Explore All Rankings
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
