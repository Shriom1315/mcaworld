'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ArrowLeft, UserPlus, Shield } from 'lucide-react'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { COLLECTIONS } from '@/types/firebase'

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
      setError('PASSWORDS DO NOT MATCH')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('PASSWORD TOO SHORT')
      setIsLoading(false)
      return
    }

    if (!formData.acceptTerms) {
      setError('ACCEPT TERMS FIRST')
      setIsLoading(false)
      return
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      )
      const user = userCredential.user

      await updateProfile(user, {
        displayName: formData.username
      })

      const userProfile = {
        id: user.uid,
        email: formData.email,
        username: formData.username,
        role: formData.role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      await setDoc(doc(db, COLLECTIONS.USERS, user.uid), userProfile)

      router.push('/dashboard')
      
    } catch (error: any) {
      console.error('Registration error:', error)
      
      let errorMessage = 'ACCOUNT CREATION FAILED'
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'EMAIL ALREADY EXISTS'
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'PASSWORD TOO WEAK'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'INVALID EMAIL'
      } else if (error.code === 'permission-denied') {
        errorMessage = 'DATABASE ERROR'
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-pixel-grid bg-pixel-grid opacity-10 pointer-events-none"></div>
      
      {/* Floating pixel elements */}
      <div className="absolute top-10 left-10 w-8 h-8 bg-pixel-green animate-pixel-float" style={{animationDelay: '0s'}}></div>
      <div className="absolute top-20 right-20 w-6 h-6 bg-pixel-cyan animate-pixel-float" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-20 left-1/4 w-4 h-4 bg-pixel-pink animate-pixel-float" style={{animationDelay: '2s'}}></div>
      <div className="absolute bottom-32 right-1/3 w-8 h-8 bg-pixel-blue animate-pixel-float" style={{animationDelay: '3s'}}></div>
      
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-20">
        <Link href="/" className="btn-pixel-yellow text-xs">
          {'{<}'} HOME
        </Link>
      </div>

      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Main Signup Dialog */}
          <div className="game-screen bg-pixel-green animate-dialog-appear">
            {/* Pixel character at top */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-pixel-yellow border-3 border-black flex items-center justify-center animate-character-bob">
                <UserPlus className="w-10 h-10 text-black" />
              </div>
            </div>
            
            <h1 className="text-4xl font-pixel text-white text-center mb-2">SIGNUP</h1>
            <h2 className="text-xl font-pixel text-pixel-yellow text-center mb-8">CREATE PLAYER</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-pixel-red border-3 border-black p-4">
                  <p className="text-white font-pixel text-sm text-center">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-white font-pixel text-sm mb-2">EMAIL:</label>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full input-pixel font-mono"
                  placeholder="ENTER EMAIL"
                />
              </div>

              <div>
                <label className="block text-white font-pixel text-sm mb-2">USERNAME:</label>
                <input
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full input-pixel font-mono"
                  placeholder="CHOOSE NAME"
                />
              </div>

              <div>
                <label className="block text-white font-pixel text-sm mb-2">ROLE:</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full input-pixel font-mono"
                >
                  <option value="teacher">TEACHER</option>
                  <option value="student">STUDENT</option>
                </select>
              </div>

              <div>
                <label className="block text-white font-pixel text-sm mb-2">PASSWORD:</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full input-pixel font-mono pr-12"
                    placeholder="CREATE PASSWORD"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-white font-pixel text-sm mb-2">CONFIRM:</label>
                <div className="relative">
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full input-pixel font-mono pr-12"
                    placeholder="REPEAT PASSWORD"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-black/20 border-2 border-white/30">
                <input
                  name="acceptTerms"
                  type="checkbox"
                  required
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 text-pixel-yellow focus:ring-pixel-yellow border-gray-300"
                />
                <div className="text-white font-mono text-xs">
                  <span>ACCEPT </span>
                  <Link href="/terms" className="text-pixel-yellow hover:text-pixel-yellow/80 underline">
                    TERMS
                  </Link>
                  <span> AND </span>
                  <Link href="/privacy" className="text-pixel-yellow hover:text-pixel-yellow/80 underline">
                    PRIVACY
                  </Link>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={!formData.acceptTerms || isLoading}
                  className="w-full btn-pixel-purple text-lg"
                >
                  {isLoading ? 'CREATING...' : 'CREATE ACCOUNT'}
                </button>
              </div>
            </form>

            {/* Menu Options */}
            <div className="mt-6 space-y-3">
              <div className="text-center">
                <p className="text-white font-pixel text-sm mb-3">OTHER OPTIONS:</p>
                <div className="grid grid-cols-2 gap-3">
                  <button className="btn-pixel-cyan text-xs p-3">
                    GOOGLE
                  </button>
                  <button className="btn-pixel-pink text-xs p-3">
                    MICROSOFT
                  </button>
                </div>
              </div>
            </div>

            {/* Sign in link */}
            <div className="mt-6 text-center">
              <p className="text-white font-mono text-sm mb-3">
                {'>'}  ALREADY PLAYER?
              </p>
              <Link href="/auth/login" className="btn-pixel-yellow text-sm">
                LOGIN HERE
              </Link>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-4 right-4 w-4 h-4 bg-pixel-yellow border border-black animate-pixel-float"></div>
            <div className="absolute bottom-4 left-4 w-3 h-3 bg-pixel-pink border border-black animate-pixel-float" style={{animationDelay: '1s'}}></div>
          </div>
        </div>
      </div>

      {/* Instructions Footer */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
        <div className="pixel-card bg-white/90 p-4 max-w-md">
          <h3 className="font-pixel text-black text-sm mb-2 text-center">SIGNUP HELP:</h3>
          <div className="font-mono text-xs text-black space-y-1">
            <div>{'>'}  FILL ALL FIELDS</div>
            <div>{'>'}  ACCEPT TERMS</div>
            <div>{'>'}  CLICK CREATE</div>
            <div>{'>'}  START GAMING!</div>
          </div>
        </div>
      </div>
    </div>
  )
}