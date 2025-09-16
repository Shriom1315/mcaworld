'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ArrowLeft, Check } from 'lucide-react'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { COLLECTIONS } from '@/types/supabase'

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'teacher' as 'teacher' | 'student',
    acceptTerms: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    if (!formData.acceptTerms) {
      setError('Please accept the terms and conditions')
      setIsLoading(false)
      return
    }

    try {
      // Create user with Firebase Auth (client-side)
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      )
      const user = userCredential.user

      // Update the user's display name
      await updateProfile(user, {
        displayName: formData.username
      })

      // Create user profile in Firestore
      const userProfile = {
        id: user.uid,
        email: formData.email,
        username: formData.username,
        role: formData.role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      await setDoc(doc(db, COLLECTIONS.USERS, user.uid), userProfile)

      // Registration successful, redirect to dashboard
      router.push('/dashboard')
      
    } catch (error: any) {
      console.error('Registration error:', error)
      
      // Handle specific Firebase Auth errors
      let errorMessage = 'Failed to create account'
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered'
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address'
      } else if (error.code === 'permission-denied') {
        errorMessage = 'Database permissions error. Please try again.'
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-kahoot-green via-kahoot-blue to-kahoot-purple items-center justify-center p-8">
        <div className="text-center text-white">
          <div className="w-64 h-64 mx-auto mb-8 bg-white/10 rounded-full flex items-center justify-center">
            <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-6xl font-bold">🚀</span>
            </div>
          </div>
          <h2 className="text-4xl font-bold mb-4">Start your learning journey!</h2>
          <p className="text-xl text-white/90 max-w-md">
            Create engaging quizzes and join the community of millions making learning awesome.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Get started for free</h1>
            <p className="text-gray-600 mb-8">Create your account to start making learning awesome</p>

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
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kahoot-purple focus:border-transparent transition-all"
                  placeholder="Choose a username"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  I am a...
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kahoot-purple focus:border-transparent transition-all"
                >
                  <option value="teacher">Teacher / Educator</option>
                  <option value="student">Student / Learner</option>
                </select>
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
                    placeholder="Create a password"
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

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kahoot-purple focus:border-transparent transition-all pr-12"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="acceptTerms"
                    name="acceptTerms"
                    type="checkbox"
                    required
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                    className="h-4 w-4 text-kahoot-purple focus:ring-kahoot-purple border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="acceptTerms" className="text-gray-700">
                    I agree to the{' '}
                    <Link href="/terms" className="text-kahoot-purple hover:text-kahoot-purple/80">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-kahoot-purple hover:text-kahoot-purple/80">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={!formData.acceptTerms || isLoading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  'Create account'
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

            {/* Sign in link */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-kahoot-purple hover:text-kahoot-purple/80 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}