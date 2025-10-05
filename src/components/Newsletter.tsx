'use client'

import { useState } from 'react'
import { Mail } from 'lucide-react'
import { subscribeToNewsletter } from '@/lib/database'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      const success = await subscribeToNewsletter(email, undefined, undefined, ['general'], 'website')
      if (success) {
        setIsSubscribed(true)
        setEmail('')
      } else {
        alert('Sorry, there was an error subscribing you to our newsletter. Please try again.')
      }
    }
  }

  return (
    <section className="bg-blue-900 text-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Stay Updated with the Latest Rankings
        </h2>
        <p className="text-xl text-blue-100 mb-8">
          Get exclusive access to monthly rankings and industry insights
        </p>
        
        {!isSubscribed ? (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
              <button
                type="submit"
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                <Mail size={20} className="mr-2" />
                Subscribe
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-green-600 text-white px-6 py-4 rounded-lg inline-block">
            <p className="text-lg font-semibold">✓ Thank you for subscribing!</p>
          </div>
        )}
      </div>
    </section>
  )
}
