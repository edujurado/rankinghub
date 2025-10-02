'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Search, Menu, X } from 'lucide-react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-yellow-400 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-red-600">Ranking</span>
            <span className="text-2xl font-bold text-black">Hub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/rankings" className="text-black hover:text-gray-700 font-medium">
              Rankings
            </Link>
            <Link href="/services" className="text-black hover:text-gray-700 font-medium">
              Services in NYC
            </Link>
            <Link href="/contact" className="text-black hover:text-gray-700 font-medium">
              Contact Us
            </Link>
            <button className="btn-secondary">
              Sign Up
            </button>
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
              <Link href="/contact" className="block px-3 py-2 text-black hover:text-gray-700">
                Contact Us
              </Link>
              <button className="w-full text-left px-3 py-2 btn-secondary">
                Sign Up
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
