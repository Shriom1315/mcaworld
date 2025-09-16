'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Play, Users, PlusCircle, BookOpen, Menu, X } from 'lucide-react'

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="relative z-10 px-4 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-kahoot-purple">K!</span>
            </div>
            <span className="text-2xl font-bold text-white">Kahoot!</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/create" className="text-white hover:text-kahoot-yellow transition-colors">
              Create
            </Link>
            <Link href="/discover" className="text-white hover:text-kahoot-yellow transition-colors">
              Discover
            </Link>
            <Link href="/library" className="text-white hover:text-kahoot-yellow transition-colors">
              Library
            </Link>
            <Link href="/reports" className="text-white hover:text-kahoot-yellow transition-colors">
              Reports
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/auth/login" className="btn-secondary">
              Log in
            </Link>
            <Link href="/auth/signup" className="btn-primary">
              Sign up
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-kahoot-purple/95 backdrop-blur-sm p-4">
            <div className="flex flex-col space-y-4">
              <Link href="/create" className="text-white py-2">Create</Link>
              <Link href="/discover" className="text-white py-2">Discover</Link>
              <Link href="/library" className="text-white py-2">Library</Link>
              <Link href="/reports" className="text-white py-2">Reports</Link>
              <div className="flex flex-col space-y-2 pt-4 border-t border-white/20">
                <Link href="/auth/login" className="btn-secondary">Log in</Link>
                <Link href="/auth/signup" className="btn-primary">Sign up</Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <main className="px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Make learning
              <br />
              <span className="text-kahoot-yellow">awesome!</span>
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Kahoot! brings the magic of learning for students, teachers, office superheroes, 
              trivia fans and lifelong learners.
            </p>
            
            {/* Game PIN Input */}
            <div className="bg-white rounded-2xl p-8 max-w-md mx-auto mb-12 shadow-2xl">
              <h2 className="text-2xl font-bold text-kahoot-purple mb-6">Join a game</h2>
              <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target as HTMLFormElement)
                const pin = formData.get('gamePin') as string
                if (pin) {
                  window.location.href = `/join?pin=${pin}`
                }
              }}>
                <input
                  name="gamePin"
                  type="text"
                  placeholder="Game PIN"
                  className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-lg focus:border-kahoot-purple focus:outline-none"
                  maxLength={6}
                  pattern="\d{6}"
                />
                <button 
                  type="submit"
                  className="w-full bg-kahoot-purple hover:bg-kahoot-purple/90 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  Enter
                </button>
              </form>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-2xl p-8 text-center shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-kahoot-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-kahoot-purple mb-4">Play</h3>
              <p className="text-gray-600">
                Join a game using a PIN and answer questions on your device
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-kahoot-green rounded-full flex items-center justify-center mx-auto mb-4">
                <PlusCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-kahoot-purple mb-4">Create</h3>
              <p className="text-gray-600">
                Make your own kahoots in minutes and share them with others
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-kahoot-red rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-kahoot-purple mb-4">Host</h3>
              <p className="text-gray-600">
                Present your kahoot live to engage your audience
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to get started?</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup" className="btn-primary text-lg px-8 py-4">
                Sign up for free
              </Link>
              <Link href="/create" className="btn-secondary text-lg px-8 py-4">
                Create a kahoot
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-12 px-4 border-t border-white/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-kahoot-purple">K!</span>
                </div>
                <span className="text-xl font-bold text-white">Kahoot!</span>
              </div>
              <p className="text-white/70">
                Making learning awesome for millions of people worldwide.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-white/70">
                <li><Link href="/features" className="hover:text-white">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/mobile" className="hover:text-white">Mobile app</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-white/70">
                <li><Link href="/about" className="hover:text-white">About us</Link></li>
                <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-white/70">
                <li><Link href="/help" className="hover:text-white">Help center</Link></li>
                <li><Link href="/community" className="hover:text-white">Community</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/20 text-center text-white/70">
            <p>&copy; 2024 Kahoot! Clone. Made with ❤️ for learning.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}