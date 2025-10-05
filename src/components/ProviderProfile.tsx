'use client'

import { useState, useEffect } from 'react'
import { Star, CheckCircle, Mail, Phone, Globe, Instagram, MapPin, Star as StarIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import Header from './Header'
import Footer from './Footer'
import { getProviderById, createContactSubmission, incrementProviderView } from '@/lib/database'
import type { Provider } from '@/lib/database'

interface ProviderProfileProps {
  providerId: string
}

export default function ProviderProfile({ providerId }: ProviderProfileProps) {
  const [provider, setProvider] = useState<Provider | null>(null)
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    eventType: '',
    message: ''
  })

  // Find provider by ID
  useEffect(() => {
    const fetchProvider = async () => {
      const foundProvider = await getProviderById(providerId)
      setProvider(foundProvider)
      
      // Track page view
      if (foundProvider) {
        await incrementProviderView(providerId)
      }
    }
    fetchProvider()
  }, [providerId])

  if (!provider) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Provider not found
            </h1>
            <p className="text-gray-600">
              The provider you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={20}
        className={i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
      />
    ))
  }

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

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!provider) return
    
    const loadingToast = toast.loading('Sending your message...')
    
    try {
      const success = await createContactSubmission({
        provider_id: provider.id,
        name: contactForm.name,
        email: contactForm.email,
        phone: contactForm.phone,
        event_date: contactForm.eventDate,
        event_type: contactForm.eventType,
        message: contactForm.message,
        status: 'new'
      })
      
      if (success) {
        toast.dismiss(loadingToast)
        toast.success('Thank you! Your message has been sent to the provider.', {
          duration: 4000,
        })
        setContactForm({
          name: '',
          email: '',
          phone: '',
          eventDate: '',
          eventType: '',
          message: ''
        })
      } else {
        toast.dismiss(loadingToast)
        toast.error('Sorry, there was an error sending your message. Please try again.', {
          duration: 5000,
        })
      }
    } catch (error) {
      toast.dismiss(loadingToast)
      toast.error('An unexpected error occurred. Please try again.', {
        duration: 5000,
      })
    }
  }

  const skills = [
    { name: 'Punctuality', rating: provider.punctuality || 0 },
    { name: 'Professionalism', rating: provider.professionalism || 0 },
    { name: 'Reliability', rating: provider.reliability || 0 },
    { name: 'Price', rating: provider.price || 0 },
    { name: 'Client Satisfaction', rating: provider.client_satisfaction || 0 }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-blue-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-gray-200 rounded-full overflow-hidden">
                  <img
                    src={provider.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.name)}&background=random&color=fff&size=128`}
                    alt={provider.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Provider Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold">{provider.name}</h1>
                  {provider.verified && (
                    <CheckCircle size={32} className="text-yellow-400" />
                  )}
                </div>
                
                <div className="flex items-center justify-center md:justify-start space-x-4 text-lg mb-4">
                  <span>{getCountryFlag(provider.country)} {provider.location}</span>
                  <div className="flex items-center space-x-1">
                    {renderStars(provider.rating)}
                    <span className="ml-2">{provider.rating}</span>
                  </div>
                </div>

                <p className="text-blue-100 text-lg max-w-2xl">
                  {provider.bio}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Skills Ratings */}
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Skills & Ratings</h2>
                <div className="space-y-4">
                  {skills.map((skill) => (
                    <div key={skill.name} className="flex items-center justify-between">
                      <span className="text-lg font-medium text-gray-700">{skill.name}</span>
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <StarIcon
                              key={i}
                              size={20}
                              className={i < skill.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                        <span className="text-lg font-semibold text-gray-900">{skill.rating}/5</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Portfolio */}
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Portfolio</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {provider.portfolio_images && provider.portfolio_images.length > 0 ? (
                    provider.portfolio_images.map((image, index) => (
                      <div key={index} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={image}
                          alt={`Portfolio ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12 text-gray-500">
                      <p>Portfolio images coming soon...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-1">
              <div className="card sticky top-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact {provider.name}</h2>
                
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Date
                    </label>
                    <input
                      type="date"
                      value={contactForm.eventDate}
                      onChange={(e) => setContactForm({ ...contactForm, eventDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Type
                    </label>
                    <select
                      value={contactForm.eventType}
                      onChange={(e) => setContactForm({ ...contactForm, eventType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    >
                      <option value="">Select event type</option>
                      <option value="wedding">Wedding</option>
                      <option value="corporate">Corporate Event</option>
                      <option value="birthday">Birthday Party</option>
                      <option value="anniversary">Anniversary</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="Tell us about your event..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full btn-primary py-3"
                  >
                    Send Message
                  </button>
                </form>

                {/* Direct Contact Info */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Direct Contact</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Mail size={16} />
                      <span>{provider.email}</span>
                    </div>
                    {provider.phone && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Phone size={16} />
                        <span>{provider.phone}</span>
                      </div>
                    )}
                    {provider.website && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Globe size={16} />
                        <a href={provider.website} className="text-blue-600 hover:underline">
                          Website
                        </a>
                      </div>
                    )}
                    {provider.instagram && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Instagram size={16} />
                        <a href={`https://instagram.com/${provider.instagram.replace('@', '')}`} className="text-blue-600 hover:underline">
                          {provider.instagram}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
