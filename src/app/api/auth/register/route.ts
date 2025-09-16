import { NextRequest, NextResponse } from 'next/server'
import { auth, db } from '@/lib/firebase'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { COLLECTIONS } from '@/types/firebase'

export async function POST(request: NextRequest) {
  try {
    const { email, username, password, role } = await request.json()

    // Basic validation
    if (!email || !username || !password || !role) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (!['teacher', 'student'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if username is already taken
    const usersRef = doc(db, COLLECTIONS.USERS, username)
    const existingUser = await getDoc(usersRef)

    if (existingUser.exists()) {
      return NextResponse.json(
        { success: false, error: 'Username already taken' },
        { status: 400 }
      )
    }

    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Update the user's display name
    await updateProfile(user, {
      displayName: username
    })

    // Create user profile in Firestore
    const userProfile = {
      id: user.uid,
      email,
      username,
      role: role as 'teacher' | 'student',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    await setDoc(doc(db, COLLECTIONS.USERS, user.uid), userProfile)

    return NextResponse.json({
      success: true,
      data: {
        user: {
          uid: user.uid,
          email: user.email,
          username,
          role
        }
      },
      message: 'Account created successfully'
    })

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
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 400 }
    )
  }
}