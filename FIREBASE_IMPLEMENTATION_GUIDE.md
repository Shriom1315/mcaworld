# Firebase Implementation Guide for BitWise

This comprehensive guide will walk you through implementing Firebase in your BitWise project.

## 🚀 **Quick Start Summary**

The project has been prepared for Firebase integration with:
- ✅ Firebase dependencies added to `package.json`
- ✅ Environment configuration files created
- ✅ Firebase types and interfaces defined
- ✅ Project structure organized for Firebase
- ✅ Comprehensive setup documentation

## 📋 **Implementation Steps**

### **Step 1: Complete Firebase Console Setup**
Follow the detailed instructions in [`FIREBASE_SETUP.md`](./FIREBASE_SETUP.md) to:
1. Create your Firebase project
2. Enable Authentication and Firestore
3. Configure security rules
4. Get your configuration keys

### **Step 2: Install Dependencies**
```bash
npm install firebase firebase-admin
```

### **Step 3: Configure Environment Variables**
Update your `.env.local` with the Firebase configuration from your console:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### **Step 4: Firebase Service Implementation**

The project includes pre-configured Firebase integration files:

#### **🔧 Firebase Configuration** (`src/lib/firebase.ts`)
```typescript
import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

export default app
```

#### **📝 Type Definitions** (`src/types/supabase.ts`)
Complete TypeScript interfaces for all Firebase collections:
- User profiles
- Quiz data
- Game sessions
- Player information
- API responses

### **Step 5: Authentication Implementation**

#### **Frontend Authentication Hook**
Create `src/hooks/useFirebaseAuth.ts`:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { COLLECTIONS } from '@/types/supabase'

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (user) {
        // Fetch user profile from Firestore
        const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, user.uid))
        if (userDoc.exists()) {
          setUserProfile({ id: userDoc.id, ...userDoc.data() })
        }
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    return await signInWithEmailAndPassword(auth, email, password)
  }

  const signUp = async (email: string, password: string, userData: any) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password)
    
    // Create user profile in Firestore
    await setDoc(doc(db, COLLECTIONS.USERS, user.uid), {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    return user
  }

  const logout = () => signOut(auth)

  return {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    logout
  }
}
```

### **Step 6: Database Operations**

#### **Quiz Management Service**
Create `src/services/quizService.ts`:

```typescript
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { COLLECTIONS, Quiz } from '@/types/supabase'

export class QuizService {
  // Get user's quizzes
  static async getUserQuizzes(userId: string): Promise<Quiz[]> {
    const q = query(
      collection(db, COLLECTIONS.QUIZZES),
      where('creatorId', '==', userId),
      orderBy('updatedAt', 'desc')
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quiz))
  }

  // Create new quiz
  static async createQuiz(quizData: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.QUIZZES), {
      ...quizData,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    return docRef.id
  }

  // Update quiz
  static async updateQuiz(quizId: string, updates: Partial<Quiz>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.QUIZZES, quizId)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    })
  }

  // Delete quiz
  static async deleteQuiz(quizId: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.QUIZZES, quizId))
  }

  // Get quiz by ID
  static async getQuiz(quizId: string): Promise<Quiz | null> {
    const docRef = doc(db, COLLECTIONS.QUIZZES, quizId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Quiz
    }
    return null
  }
}
```

#### **Game Management Service**
Create `src/services/gameService.ts`:

```typescript
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  query,
  where,
  onSnapshot,
  arrayUnion
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { COLLECTIONS, Game, Player } from '@/types/supabase'

export class GameService {
  // Generate unique game PIN
  static generateGamePin(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  // Create new game
  static async createGame(gameData: Omit<Game, 'id' | 'pin' | 'createdAt' | 'updatedAt'>): Promise<{ gameId: string, pin: string }> {
    const pin = this.generateGamePin()
    
    const docRef = await addDoc(collection(db, COLLECTIONS.GAMES), {
      ...gameData,
      pin,
      players: [],
      status: 'waiting',
      currentQuestionIndex: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    return { gameId: docRef.id, pin }
  }

  // Find game by PIN
  static async findGameByPin(pin: string): Promise<Game | null> {
    const q = query(
      collection(db, COLLECTIONS.GAMES),
      where('pin', '==', pin)
    )
    
    const snapshot = await getDocs(q)
    if (snapshot.empty) return null
    
    const doc = snapshot.docs[0]
    return { id: doc.id, ...doc.data() } as Game
  }

  // Add player to game
  static async addPlayerToGame(gameId: string, player: Player): Promise<void> {
    const docRef = doc(db, COLLECTIONS.GAMES, gameId)
    await updateDoc(docRef, {
      players: arrayUnion(player),
      updatedAt: new Date()
    })
  }

  // Update game status
  static async updateGameStatus(gameId: string, status: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.GAMES, gameId)
    await updateDoc(docRef, {
      status,
      updatedAt: new Date()
    })
  }

  // Real-time game listener
  static subscribeToGame(gameId: string, callback: (game: Game) => void): () => void {
    const docRef = doc(db, COLLECTIONS.GAMES, gameId)
    
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() } as Game)
      }
    })
  }
}
```

### **Step 7: Real-time Features**

#### **Real-time Game Hook**
Create `src/hooks/useGameRealtime.ts`:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { GameService } from '@/services/gameService'
import { Game } from '@/types/supabase'

export function useGameRealtime(gameId: string | null) {
  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!gameId) {
      setLoading(false)
      return
    }

    // Subscribe to real-time updates
    const unsubscribe = GameService.subscribeToGame(gameId, (updatedGame) => {
      setGame(updatedGame)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [gameId])

  return { game, loading }
}
```

### **Step 8: Update Existing Components**

#### **Update Authentication Pages**
Replace Supabase authentication calls with Firebase:

```typescript
// In login/signup pages
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'

const { signIn, signUp, loading } = useFirebaseAuth()

// Login
await signIn(email, password)

// Signup
await signUp(email, password, { username, role })
```

#### **Update Dashboard**
Replace quiz fetching with Firebase:

```typescript
// In dashboard page
import { QuizService } from '@/services/quizService'

const quizzes = await QuizService.getUserQuizzes(currentUser.uid)
```

### **Step 9: API Routes Update**

Update your API routes to use Firebase Admin SDK for server-side operations:

```typescript
// src/app/api/auth/login/route.ts
import { auth } from 'firebase-admin'
import { initializeApp, getApps, cert } from 'firebase-admin/app'

// Initialize Firebase Admin
if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

// Verify ID tokens in API routes
const decodedToken = await auth().verifyIdToken(idToken)
```

## 🔧 **Development Workflow**

### **Testing Firebase Integration**

1. **Start Development Server**:
   ```bash
   npm run dev
   ```

2. **Test Authentication**:
   - Create account on signup page
   - Verify user appears in Firebase Console
   - Test login functionality

3. **Test Database Operations**:
   - Create a quiz
   - Check Firestore Console for data
   - Test real-time updates

4. **Test Game Flow**:
   - Create a game
   - Join with PIN
   - Monitor real-time updates

### **Firebase Console Monitoring**

Monitor your application through:
- **Authentication**: User registrations and logins
- **Firestore**: Database reads/writes and real-time listeners
- **Usage**: Daily/monthly usage statistics

## 🎯 **Production Deployment**

### **Environment Setup**
1. Update Firebase security rules for production
2. Configure production domains in Firebase Console
3. Set up proper environment variables
4. Enable Firebase Analytics (optional)

### **Performance Optimization**
1. Implement Firebase caching strategies
2. Use Firebase indexes for complex queries
3. Optimize real-time listener usage
4. Implement offline support with Firebase

## 📚 **Additional Features**

### **Enhanced Functionality**
- **Image Upload**: Use Firebase Storage for quiz images
- **Push Notifications**: Firebase Cloud Messaging for game alerts
- **Analytics**: Firebase Analytics for user behavior tracking
- **Hosting**: Firebase Hosting for easy deployment

### **Security Best Practices**
- Implement proper Firestore security rules
- Use Firebase App Check for abuse protection
- Secure API routes with Firebase Admin SDK
- Implement rate limiting for API endpoints

## ✅ **Verification Checklist**

- [ ] Firebase project created and configured
- [ ] Environment variables set correctly
- [ ] Authentication working (signup/login)
- [ ] Firestore data operations functional
- [ ] Real-time features working
- [ ] Security rules properly configured
- [ ] API routes using Firebase Admin SDK
- [ ] Game creation and joining functional
- [ ] Real-time multiplayer working

## 🚀 **Ready to Go!**

Your BitWise platform now has Firebase integration ready for:
- ✅ **Real-time multiplayer games**
- ✅ **Scalable user authentication**
- ✅ **Cloud-based quiz storage**
- ✅ **Live game synchronization**
- ✅ **Production-ready architecture**

Follow the step-by-step implementation guide above to activate Firebase in your project!