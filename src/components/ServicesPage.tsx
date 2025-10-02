import Header from './Header'
import Footer from './Footer'
import Link from 'next/link'
import { Music, Camera, Video, Star, CheckCircle } from 'lucide-react'

export default function ServicesPage() {
  const services = [
    {
      title: 'DJs',
      icon: Music,
      description: 'Professional DJs for all types of events',
      features: [
        'Wedding DJs',
        'Corporate Event DJs',
        'Party DJs',
        'Club DJs',
        'Radio DJs'
      ],
      href: '/rankings?category=djs',
      color: 'bg-purple-500'
    },
    {
      title: 'Photographers',
      icon: Camera,
      description: 'Expert photographers for every occasion',
      features: [
        'Wedding Photography',
        'Event Photography',
        'Portrait Photography',
        'Commercial Photography',
        'Fashion Photography'
      ],
      href: '/rankings?category=photographers',
      color: 'bg-blue-500'
    },
    {
      title: 'Videographers',
      icon: Video,
      description: 'Professional video production services',
      features: [
        'Wedding Videography',
        'Event Videography',
        'Corporate Videos',
        'Promotional Videos',
        'Documentary Style'
      ],
      href: '/rankings?category=videographers',
      color: 'bg-green-500'
    }
  ]

  const benefits = [
    {
      icon: Star,
      title: 'Verified Professionals',
      description: 'All our service providers are verified and rated by real clients'
    },
    {
      icon: CheckCircle,
      title: 'Quality Guaranteed',
      description: 'We ensure only the best professionals make it to our rankings'
    },
    {
      icon: Music,
      title: 'NYC Focused',
      description: 'Specialized in New York City event services and venues'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-blue-900 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Services in NYC
            </h1>
            <p className="text-xl md:text-2xl mb-12 text-blue-100">
              Find the perfect service provider for your New York City event
            </p>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Our Service Categories
              </h2>
              <p className="text-xl text-gray-600">
                Professional event services across all categories
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {services.map((service) => {
                const IconComponent = service.icon
                return (
                  <div key={service.title} className="card hover:shadow-xl transition-shadow duration-300">
                    <div className="text-center">
                      <div className={`w-20 h-20 ${service.color} rounded-full flex items-center justify-center mx-auto mb-6`}>
                        <IconComponent size={40} className="text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        {service.title}
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {service.description}
                      </p>
                      
                      <ul className="text-left space-y-2 mb-8">
                        {service.features.map((feature, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Link href={service.href} className="btn-primary w-full">
                        View Rankings
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Choose RankingHub?
              </h2>
              <p className="text-xl text-gray-600">
                We make finding the perfect service provider easy and reliable
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => {
                const IconComponent = benefit.icon
                return (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent size={32} className="text-black" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600">
                      {benefit.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-blue-900 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Find Your Perfect Service Provider?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Browse our verified rankings and connect with the best professionals in NYC
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/rankings" className="btn-primary text-lg px-8 py-3">
                View All Rankings
              </Link>
              <Link href="/contact" className="btn-outline text-lg px-8 py-3">
                Get a Quote
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
