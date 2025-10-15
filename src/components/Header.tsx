'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Search, Menu, X, User, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'
import AuthModal from './AuthModal'
import { getCurrentUser, signOut } from '@/lib/auth'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      setLoading(false)
    }
    fetchUser()
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Successfully signed out!', {
        duration: 2000,
      })
      setUser(null)
      window.location.reload()
    } catch (error) {
      toast.error('Error signing out. Please try again.', {
        duration: 5000,
      })
    }
  }

  return (
    <header className="bg-yellow-400 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="flex items-center space-x-1">
              <span className="text-3xl font-bold text-red-600 group-hover:text-red-700 transition-colors">Ranking</span>
              <span className="text-3xl font-bold text-black group-hover:text-gray-800 transition-colors">Hub</span>
            </div>
            <div className="hidden sm:block ml-2">
              <span className="text-xs font-medium text-gray-600 bg-white/20 px-2 py-1 rounded-full">
                NYC
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/rankings" className="text-black hover:text-gray-700 font-medium">
              Rankings
            </Link>
            <Link href="/services" className="text-black hover:text-gray-700 font-medium">
              Services in NYC
            </Link>
            <Link href="/blog" className="text-black hover:text-gray-700 font-medium">
              Blog
            </Link>
            <Link href="/contact" className="text-black hover:text-gray-700 font-medium">
              Contact Us
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                {user.role === 'admin' && (
                  <Link href="/admin" className="text-black hover:text-gray-700 font-medium">
                    Admin
                  </Link>
                )}
                <div className="flex items-center space-x-2">
                  <User size={20} />
                  <span className="text-black font-medium">{user.email}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 text-black hover:text-gray-700"
                >
                  <LogOut size={20} />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="btn-secondary"
              >
                Sign Up
              </button>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-yellow-400">
              <Link href="/rankings" className="block px-3 py-2 text-black hover:text-gray-700">
                Rankings
              </Link>
              <Link href="/services" className="block px-3 py-2 text-black hover:text-gray-700">
                Services in NYC
              </Link>
              <Link href="/blog" className="block px-3 py-2 text-black hover:text-gray-700">
                Blog
              </Link>
              <Link href="/contact" className="block px-3 py-2 text-black hover:text-gray-700">
                Contact Us
              </Link>
              
              {user ? (
                <div className="space-y-2">
                  {user.role === 'admin' && (
                    <Link href="/admin" className="block px-3 py-2 text-black hover:text-gray-700">
                      Admin
                    </Link>
                  )}
                  <div className="px-3 py-2 text-black">
                    <User size={16} className="inline mr-2" />
                    {user.email}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-3 py-2 text-black hover:text-gray-700"
                  >
                    <LogOut size={16} className="inline mr-2" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="w-full text-left px-3 py-2 btn-secondary"
                >
                  Sign Up
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </header>
  )
}
