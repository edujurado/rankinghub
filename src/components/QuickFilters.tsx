import Link from 'next/link'
import { Music, Camera, Video } from 'lucide-react'

export default function QuickFilters() {
  const categories = [
    {
      name: 'DJs',
      icon: Music,
      href: '/rankings?category=djs',
      description: 'Top-rated DJs for your events',
      color: 'bg-purple-500'
    },
    {
      name: 'Photographers',
      icon: Camera,
      href: '/rankings?category=photographers',
      description: 'Professional event photographers',
      color: 'bg-blue-500'
    },
    {
      name: 'Videographers',
      icon: Video,
      href: '/rankings?category=videographers',
      description: 'Expert video production services',
      color: 'bg-green-500'
    }
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  <p className="text-gray-600 mb-6">
                    {category.description}
                  </p>
                  <div className="text-yellow-400 font-semibold group-hover:text-yellow-500">
                    View Rankings →
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
