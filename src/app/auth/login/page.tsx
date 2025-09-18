'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ArrowLeft, User, Lock } from 'lucide-react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { COLLECTIONS } from '@/types/firebase'

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
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      )
      const user = userCredential.user

      const userDocRef = doc(db, COLLECTIONS.USERS, user.uid)
      const userDoc = await getDoc(userDocRef)

      if (userDoc.exists()) {
        console.log('User profile:', userDoc.data())
      }

      router.push('/dashboard')
      
    } catch (error: any) {
      console.error('Login error:', error)
      
      let errorMessage = 'LOGIN FAILED'
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'INVALID CREDENTIALS'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'INVALID EMAIL'
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'TOO MANY ATTEMPTS'
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-pixel-grid bg-pixel-grid opacity-10 pointer-events-none"></div>
      
      {/* Floating pixel elements */}
      <div className="absolute top-10 left-10 w-8 h-8 bg-pixel-blue animate-pixel-float" style={{animationDelay: '0s'}}></div>
      <div className="absolute top-20 right-20 w-6 h-6 bg-pixel-pink animate-pixel-float" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-20 left-1/4 w-4 h-4 bg-pixel-cyan animate-pixel-float" style={{animationDelay: '2s'}}></div>
      <div className="absolute bottom-32 right-1/3 w-8 h-8 bg-pixel-green animate-pixel-float" style={{animationDelay: '3s'}}></div>
      
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-20">
        <Link href="/" className="btn-pixel-yellow text-xs">
          {'{<}'} HOME
        </Link>
      </div>

      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Main Menu Dialog */}
          <div className="game-screen bg-pixel-purple animate-dialog-appear">
            {/* Pixel character at top */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-pixel-yellow border-3 border-black flex items-center justify-center animate-character-bob">
                <User className="w-10 h-10 text-black" />
              </div>
            </div>
            
            <h1 className="text-4xl font-pixel text-white text-center mb-2">LOGIN</h1>
            <h2 className="text-xl font-pixel text-pixel-yellow text-center mb-8">MENU</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-pixel-red border-3 border-black p-4">
                  <p className="text-white font-pixel text-sm text-center">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-white font-pixel text-sm mb-3">EMAIL:</label>
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
                <label className="block text-white font-pixel text-sm mb-3">PASSWORD:</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full input-pixel font-mono pr-12"
                    placeholder="ENTER PASSWORD"
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

              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-pixel-green text-lg"
                >
                  {isLoading ? 'CONNECTING...' : 'LOGIN'}
                </button>
                
                <Link href="/auth/forgot-password" className="block w-full btn-pixel-yellow text-sm text-center">
                  FORGOT PASSWORD?
                </Link>
              </div>
            </form>

            {/* Menu Options */}
            <div className="mt-8 space-y-3">
              <div className="text-center">
                <p className="text-white font-pixel text-sm mb-4">OTHER OPTIONS:</p>
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

            {/* Sign up link */}
            <div className="mt-8 text-center">
              <p className="text-white font-mono text-sm mb-3">
                {'>'}  NEW PLAYER?
              </p>
              <Link href="/auth/signup" className="btn-pixel-green text-sm">
                CREATE ACCOUNT
              </Link>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-4 right-4 w-4 h-4 bg-pixel-cyan border border-black animate-pixel-float"></div>
            <div className="absolute bottom-4 left-4 w-3 h-3 bg-pixel-red border border-black animate-pixel-float" style={{animationDelay: '1s'}}></div>
          </div>
        </div>
      </div>

      {/* Instructions Footer */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
        <div className="pixel-card bg-white/90 p-4 max-w-md">
          <h3 className="font-pixel text-black text-sm mb-2 text-center">LOGIN HELP:</h3>
          <div className="font-mono text-xs text-black space-y-1">
            <div>{'>'}  ENTER YOUR EMAIL</div>
            <div>{'>'}  ENTER PASSWORD</div>
            <div>{'>'}  CLICK LOGIN</div>
            <div>{'>'}  START PLAYING!</div>
          </div>
        </div>
      </div>
    </div>
  )
}