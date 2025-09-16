'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { COLLECTIONS } from '@/types/supabase'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Sign in with Firebase Auth (client-side)
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      )
      const user = userCredential.user

      // Optional: Get user profile from Firestore
      const userDocRef = doc(db, COLLECTIONS.USERS, user.uid)
      const userDoc = await getDoc(userDocRef)

      if (userDoc.exists()) {
        console.log('User profile:', userDoc.data())
      }

      // Login successful, redirect to dashboard
      router.push('/dashboard')
      
    } catch (error: any) {
      console.error('Login error:', error)
      
      // Handle specific Firebase auth errors
      let errorMessage = 'Failed to sign in'
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address'
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.'
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <Link href="/" className="inline-flex items-center text-kahoot-purple hover:text-kahoot-purple/80 mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </Link>

          {/* Logo */}
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-12 h-12 bg-kahoot-purple rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-white">K!</span>
            </div>
            <span className="text-3xl font-bold text-kahoot-purple">Kahoot!</span>
          </div>

          {/* Form */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h1>
            <p className="text-gray-600 mb-8">Sign in to your account to continue</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kahoot-purple focus:border-transparent transition-all"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kahoot-purple focus:border-transparent transition-all pr-12"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-kahoot-purple focus:ring-kahoot-purple border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                <Link href="/auth/forgot-password" className="text-sm text-kahoot-purple hover:text-kahoot-purple/80">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            {/* Social Login */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span>Google</span>
                </button>
                <button className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span>Microsoft</span>
                </button>
              </div>
            </div>

            {/* Sign up link */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link href="/auth/signup" className="text-kahoot-purple hover:text-kahoot-purple/80 font-medium">
                  Sign up for free
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-kahoot-purple via-kahoot-blue to-kahoot-pink items-center justify-center p-8">
        <div className="text-center text-white">
          <div className="w-64 h-64 mx-auto mb-8 bg-white/10 rounded-full flex items-center justify-center">
            <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-6xl font-bold">🎯</span>
            </div>
          </div>
          <h2 className="text-4xl font-bold mb-4">Welcome back to learning!</h2>
          <p className="text-xl text-white/90 max-w-md">
            Join millions of learners and educators who make learning awesome with Kahoot!
          </p>
        </div>
      </div>
    </div>
  )
}