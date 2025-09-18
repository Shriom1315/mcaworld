'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Users, Gamepad2, Star } from 'lucide-react'
import Link from 'next/link'
import { collection, doc, getDoc, getDocs, updateDoc, addDoc, query, where, Timestamp } from 'firebase/firestore'
import { signInAnonymously } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { COLLECTIONS } from '@/types/firebase'

export default function JoinGamePage() {
  const [gamePin, setGamePin] = useState('')
  const [nickname, setNickname] = useState('')
  const [step, setStep] = useState<'pin' | 'nickname' | 'ready'>('pin')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isAuthenticating, setIsAuthenticating] = useState(true)
  const router = useRouter()

  // Clear any previous session data on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kahoot_game_pin')
      localStorage.removeItem('kahoot_player_id')
      localStorage.removeItem('kahoot_nickname')
    }
    
    const signInAnonymousUser = async () => {
      try {
        if (!auth.currentUser) {
          await signInAnonymously(auth)
          console.log('Signed in anonymously for quiz participation')
        }
      } catch (error) {
        console.error('Error signing in anonymously:', error)
      } finally {
        setIsAuthenticating(false)
      }
    }
    
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log('User is authenticated:', user.uid)
        setIsAuthenticating(false)
      } else {
        signInAnonymousUser()
      }
    })
    
    return () => unsubscribe()
  }, [])

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (!auth.currentUser) {
      setError('Authentication required. Please wait and try again.')
      setIsLoading(false)
      return
    }

    if (!/^\d{6}$/.test(gamePin)) {
      setError('Game PIN must be 6 digits')
      setIsLoading(false)
      return
    }

    try {
      const gamesRef = collection(db, COLLECTIONS.GAMES)
      const gameQuery = query(gamesRef, where('pin', '==', gamePin))
      const querySnapshot = await getDocs(gameQuery)
      
      if (querySnapshot.empty) {
        setError('Game not found. Please check the PIN and try again.')
        setIsLoading(false)
        return
      }

      const gameDoc = querySnapshot.docs[0]
      const game = { id: gameDoc.id, ...gameDoc.data() } as any

      if (game.status !== 'waiting') {
        setError('Game has already started')
        setIsLoading(false)
        return
      }

      setStep('nickname')
      
    } catch (error: any) {
      console.error('Error verifying game:', error)
      
      let errorMessage = 'Failed to connect to game. Please try again.'
      if (error.code === 'permission-denied') {
        errorMessage = 'Authentication error. Please refresh the page and try again.'
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNicknameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (!auth.currentUser) {
      console.error('No authenticated user found when trying to join game')
      setError('Authentication required. Please refresh the page and try again.')
      setIsLoading(false)
      return
    }

    if (nickname.trim().length < 2) {
      setError('Nickname must be at least 2 characters')
      setIsLoading(false)
      return
    }

    try {
      const gamesRef = collection(db, COLLECTIONS.GAMES)
      const gameQuery = query(gamesRef, where('pin', '==', gamePin))
      const querySnapshot = await getDocs(gameQuery)
      
      if (querySnapshot.empty) {
        setError('Game not found')
        setIsLoading(false)
        return
      }

      const gameDoc = querySnapshot.docs[0]
      const game = { id: gameDoc.id, ...gameDoc.data() } as any

      const players = Array.isArray(game.players) ? game.players : []
      const existingPlayer = players.find((p: any) => p.nickname === nickname.trim())
      if (existingPlayer) {
        setError('Nickname already taken')
        setIsLoading(false)
        return
      }

      const playerId = crypto.randomUUID()

      const newPlayer = {
        id: playerId,
        nickname: nickname.trim(),
        score: 0,
        answers: [],
        joinedAt: new Date().toISOString(),
        isActive: true
      }

      const updatedPlayers = [...players, newPlayer]

      const gameDocRef = doc(db, COLLECTIONS.GAMES, game.id)
      await updateDoc(gameDocRef, { players: updatedPlayers })

      const gameSessionsRef = collection(db, COLLECTIONS.GAME_SESSIONS)
      const sessionDoc = await addDoc(gameSessionsRef, {
        gameId: game.id,
        playerId: playerId,
        nickname: nickname.trim(),
        score: 0,
        answers: [],
        joinedAt: Timestamp.now(),
        isActive: true
      })
      
      console.log('Player joined successfully:', {
        sessionId: sessionDoc.id,
        gameId: game.id,
        playerId: playerId,
        nickname: nickname.trim(),
        userId: auth.currentUser?.uid
      })

      setStep('ready')
      
      setTimeout(() => {
        router.push(`/game/lobby/${gamePin}?nickname=${encodeURIComponent(nickname)}&playerId=${playerId}`)
      }, 3000)
      
    } catch (error: any) {
      console.error('Error joining game:', error)
      
      let errorMessage = 'Failed to join game. Please try again.'
      if (error.code === 'permission-denied') {
        errorMessage = 'Firebase permission denied. Please check if anonymous authentication is enabled in Firebase Console.'
      } else if (error.code === 'unavailable') {
        errorMessage = 'Firebase service unavailable. Please check your internet connection.'
      } else if (error.code === 'unauthenticated') {
        errorMessage = 'Authentication error. Please refresh the page and try again.'
      }
      
      setError(errorMessage)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-pixel-grid bg-pixel-grid opacity-10 pointer-events-none"></div>
      
      {/* Floating pixel elements */}
      <div className="absolute top-10 left-10 w-6 h-6 bg-pixel-cyan animate-pixel-float" style={{animationDelay: '0s'}}></div>
      <div className="absolute top-32 right-20 w-8 h-8 bg-pixel-pink animate-pixel-float" style={{animationDelay: '1.5s'}}></div>
      <div className="absolute bottom-20 left-1/4 w-4 h-4 bg-pixel-green animate-pixel-float" style={{animationDelay: '3s'}}></div>
      <div className="absolute bottom-40 right-1/3 w-6 h-6 bg-pixel-red animate-pixel-float" style={{animationDelay: '4.5s'}}></div>
      
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-20">
        <Link href="/" className="btn-pixel-yellow text-xs">
          {'{<}'} BACK
        </Link>
      </div>

      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {isAuthenticating ? (
            <div className="game-screen bg-pixel-purple animate-dialog-appear">
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-pixel-yellow border-3 border-black mx-auto flex items-center justify-center animate-pixel-pulse">
                  <div className="w-8 h-8 border-2 border-black rounded animate-spin"></div>
                </div>
                <h2 className="text-2xl font-pixel text-white">LOADING...</h2>
                <p className="text-white font-mono">{'>'}  Setting up your session...</p>
              </div>
            </div>
          ) : (
            <>
              {step === 'pin' && (
                <div className="game-screen bg-pixel-purple animate-dialog-appear">
                  {/* Pixel character */}
                  <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-pixel-yellow border-3 border-black flex items-center justify-center animate-character-bob">
                      <Gamepad2 className="w-10 h-10 text-black" />
                    </div>
                  </div>
                  
                  <h1 className="text-3xl font-pixel text-white text-center mb-8">ENTER PIN</h1>
                  
                  <form onSubmit={handlePinSubmit} className="space-y-6">
                    <div>
                      <input
                        type="text"
                        value={gamePin}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                          setGamePin(value)
                        }}
                        placeholder="000000"
                        className="w-full input-pixel text-center text-3xl font-pixel tracking-widest"
                        maxLength={6}
                        required
                      />
                      <p className="text-white/80 font-mono text-sm mt-2 text-center">
                        {'>'}  Enter 6-digit game PIN
                      </p>
                    </div>

                    {error && (
                      <div className="bg-pixel-red border-3 border-black p-4">
                        <p className="text-white font-mono text-sm">{'>'}  {error}</p>
                      </div>
                    )}

                    <button 
                      type="submit" 
                      className="w-full btn-pixel-green text-lg"
                      disabled={gamePin.length !== 6 || isLoading}
                    >
                      {isLoading ? 'CONNECTING...' : 'ENTER GAME'}
                    </button>
                  </form>
                </div>
              )}

              {step === 'nickname' && (
                <div className="game-screen bg-pixel-blue animate-dialog-appear">
                  <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-pixel-white border-3 border-black flex items-center justify-center animate-character-bob">
                      <Users className="w-10 h-10 text-black" />
                    </div>
                  </div>
                  
                  <h1 className="text-3xl font-pixel text-white text-center mb-2">GAME FOUND!</h1>
                  <p className="text-white font-mono text-center mb-8">{'>'}  PIN: {gamePin}</p>
                  
                  <form onSubmit={handleNicknameSubmit} className="space-y-6">
                    <div>
                      <h2 className="text-xl font-pixel text-white mb-4">ENTER NAME:</h2>
                      <input
                        type="text"
                        value={nickname}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNickname(e.target.value.slice(0, 20))}
                        placeholder="YOUR NAME"
                        className="w-full input-pixel text-center text-xl font-mono uppercase"
                        maxLength={20}
                        required
                      />
                      <p className="text-white/80 font-mono text-sm mt-2 text-center">
                        {'>'}  How others will see you
                      </p>
                    </div>

                    {error && (
                      <div className="bg-pixel-red border-3 border-black p-4">
                        <p className="text-white font-mono text-sm">{'>'}  {error}</p>
                      </div>
                    )}

                    <div className="space-y-3">
                      <button 
                        type="submit" 
                        className="w-full btn-pixel-green text-lg"
                        disabled={nickname.trim().length < 2 || isLoading}
                      >
                        {isLoading ? 'JOINING...' : 'JOIN GAME'}
                      </button>

                      <button 
                        type="button" 
                        className="w-full btn-pixel-yellow text-sm"
                        onClick={() => setStep('pin')}
                        disabled={isLoading}
                      >
                        CHANGE PIN
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {step === 'ready' && (
                <div className="dialog-box bg-white max-w-md mx-auto animate-dialog-appear">
                  <div className="text-center space-y-6">
                    {/* Pixel characters around dialog */}
                    <div className="flex justify-center space-x-4 mb-6">
                      <div className="w-12 h-12 bg-pixel-purple border-2 border-black animate-character-bob"></div>
                      <div className="w-16 h-16 bg-pixel-yellow border-3 border-black flex items-center justify-center animate-pixel-pulse">
                        <Star className="w-8 h-8 text-black" />
                      </div>
                      <div className="w-12 h-12 bg-pixel-pink border-2 border-black animate-character-bob" style={{animationDelay: '0.5s'}}></div>
                    </div>
                    
                    <h1 className="text-4xl font-pixel text-black mb-4">ARE YOU READY?</h1>
                    
                    <div className="pixel-card bg-pixel-green/20 border-3 border-pixel-green p-4">
                      <p className="font-pixel text-lg text-black mb-2">WELCOME!</p>
                      <p className="font-mono text-black">{nickname}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-center space-x-8">
                        <button className="btn-pixel-green text-sm px-8">YES</button>
                        <button className="btn-pixel-red text-sm px-8">NO</button>
                      </div>
                      <p className="text-sm text-gray-600 font-mono">
                        {'>'}  Redirecting to lobby...
                      </p>
                    </div>
                    
                    {/* Decorative elements */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-pixel-cyan border-2 border-black animate-pixel-float"></div>
                    <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-pixel-red border border-black animate-pixel-float" style={{animationDelay: '1s'}}></div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Instructions Footer */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
        <div className="pixel-card bg-white/90 p-4 max-w-md">
          <h3 className="font-pixel text-black text-sm mb-2 text-center">HOW TO PLAY:</h3>
          <div className="font-mono text-xs text-black space-y-1">
            <div>{'>'}  1. ENTER GAME PIN</div>
            <div>{'>'}  2. CHOOSE NICKNAME</div>
            <div>{'>'}  3. WAIT FOR START</div>
            <div>{'>'}  4. ANSWER FAST!</div>
          </div>
        </div>
      </div>
    </div>
  )
}