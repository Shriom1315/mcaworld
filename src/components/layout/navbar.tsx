'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, User, Settings, LogOut, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Avatar from '@/components/avatar/Avatar'

interface NavbarProps {
  user?: {
    username: string
    email: string
    role: string
  }
}

export function Navbar({ user }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={user ? '/dashboard' : '/'} className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-kahoot-purple rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold text-white">K!</span>
            </div>
            <span className="text-xl font-bold text-kahoot-purple">Kahoot!</span>
          </Link>

          {user ? (
            // Authenticated Navigation
            <>
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <Link href="/dashboard" className="text-gray-700 hover:text-kahoot-purple transition-colors">
                  Library
                </Link>
                <Link href="/discover" className="text-gray-700 hover:text-kahoot-purple transition-colors">
                  Discover
                </Link>
                <Link href="/reports" className="text-gray-700 hover:text-kahoot-purple transition-colors">
                  Reports
                </Link>
              </div>

              <div className="hidden md:flex items-center space-x-4">
                <Button asChild>
                  <Link href="/create">
                    <Plus className="w-4 h-4 mr-2" />
                    Create
                  </Link>
                </Button>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8">
                      <Avatar avatarId="teacher" size="sm" className="w-full h-full" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user.username}</span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                      <div className="p-4 border-b">
                        <p className="text-sm font-medium text-gray-900">{user.username}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        <p className="text-xs text-kahoot-purple capitalize">{user.role}</p>
                      </div>
                      <div className="p-1">
                        <Link href="/profile" className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                          <User className="w-4 h-4 mr-2" />
                          Profile
                        </Link>
                        <Link href="/settings" className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </Link>
                        <button className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded">
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden text-gray-700"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </>
          ) : (
            // Unauthenticated Navigation
            <>
              <div className="hidden md:flex items-center space-x-8">
                <Link href="/discover" className="text-gray-700 hover:text-kahoot-purple transition-colors">
                  Discover
                </Link>
                <Link href="/features" className="text-gray-700 hover:text-kahoot-purple transition-colors">
                  Features
                </Link>
                <Link href="/pricing" className="text-gray-700 hover:text-kahoot-purple transition-colors">
                  Pricing
                </Link>
              </div>

              <div className="hidden md:flex items-center space-x-4">
                <Button variant="secondary" asChild>
                  <Link href="/auth/login">Log in</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/signup">Sign up</Link>
                </Button>
              </div>

              <button
                className="md:hidden text-gray-700"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-4">
            {user ? (
              <div className="space-y-4">
                <Link href="/dashboard" className="block py-2 text-gray-700">Library</Link>
                <Link href="/discover" className="block py-2 text-gray-700">Discover</Link>
                <Link href="/reports" className="block py-2 text-gray-700">Reports</Link>
                <div className="pt-4 border-t">
                  <Button className="w-full mb-4" asChild>
                    <Link href="/create">
                      <Plus className="w-4 h-4 mr-2" />
                      Create
                    </Link>
                  </Button>
                  <div className="space-y-2">
                    <Link href="/profile" className="block py-2 text-gray-700">Profile</Link>
                    <Link href="/settings" className="block py-2 text-gray-700">Settings</Link>
                    <button className="block py-2 text-red-600">Sign out</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Link href="/discover" className="block py-2 text-gray-700">Discover</Link>
                <Link href="/features" className="block py-2 text-gray-700">Features</Link>
                <Link href="/pricing" className="block py-2 text-gray-700">Pricing</Link>
                <div className="pt-4 border-t space-y-2">
                  <Button variant="secondary" className="w-full" asChild>
                    <Link href="/auth/login">Log in</Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link href="/auth/signup">Sign up</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}