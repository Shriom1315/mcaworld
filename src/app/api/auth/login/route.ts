import { NextRequest, NextResponse } from 'next/server'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { COLLECTIONS } from '@/types/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Get user profile from Firestore
    const userDocRef = doc(db, COLLECTIONS.USERS, user.uid)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      )
    }

    const userProfile = { id: userDoc.id, ...userDoc.data() }

    // Get ID token for client-side authentication
    const idToken = await user.getIdToken()

    return NextResponse.json({
      success: true,
      data: {
        user: userProfile,
        token: idToken
      }
    })

  } catch (error: any) {
    console.error('Login error:', error)
    
    // Handle specific Firebase auth errors
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}