'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Users, Gamepad2 } from 'lucide-react'
import Link from 'next/link'
import { collection, doc, getDoc, getDocs, updateDoc, addDoc, query, where, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { COLLECTIONS } from '@/types/firebase'

export default function JoinGamePage() {
  // Always start fresh - no stored PIN or nickname
  const [gamePin, setGamePin] = useState('')
  const [nickname, setNickname] = useState('')
  const [step, setStep] = useState<'pin' | 'nickname' | 'waiting'>('pin')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Clear any previous session data on component mount
  useEffect(() => {
    // Clear localStorage if any game data was stored
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kahoot_game_pin')
      localStorage.removeItem('kahoot_player_id')
      localStorage.removeItem('kahoot_nickname')
    }
  }, [])

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Validate PIN format
    if (!/^\d{6}$/.test(gamePin)) {
      setError('Game PIN must be 6 digits')
      setIsLoading(false)
      return
    }

    try {
      // Verify game exists and is accepting players (client-side)
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
        errorMessage = 'Please deploy Firebase security rules first.'
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

    if (nickname.trim().length < 2) {
      setError('Nickname must be at least 2 characters')
      setIsLoading(false)
      return
    }

    try {
      // Join the game with nickname (client-side)
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

      // Check if nickname is already taken
      const players = Array.isArray(game.players) ? game.players : []
      const existingPlayer = players.find((p: any) => p.nickname === nickname.trim())
      if (existingPlayer) {
        setError('Nickname already taken')
        setIsLoading(false)
        return
      }

      // Generate a unique player ID
      const playerId = crypto.randomUUID()

      // Add player to game
      const newPlayer = {
        id: playerId,
        nickname: nickname.trim(),
        score: 0,
        answers: [],
        joinedAt: new Date().toISOString(),
        isActive: true
      }

      const updatedPlayers = [...players, newPlayer]

      // Update the game with new player
      const gameDocRef = doc(db, COLLECTIONS.GAMES, game.id)
      await updateDoc(gameDocRef, { players: updatedPlayers })

      // Create a game session record
      const gameSessionsRef = collection(db, COLLECTIONS.GAME_SESSIONS)
      const sessionDoc = await addDoc(gameSessionsRef, {
        gameId: game.id,  // Note: using gameId to match our query
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
        nickname: nickname.trim()
      })

      setStep('waiting')
      
      // Redirect to game lobby after joining
      setTimeout(() => {
        router.push(`/game/lobby/${gamePin}?nickname=${encodeURIComponent(nickname)}&playerId=${playerId}`)
      }, 2000)
      
    } catch (error: any) {
      console.error('Error joining game:', error)
      
      let errorMessage = 'Failed to join game. Please try again.'
      if (error.code === 'permission-denied') {
        errorMessage = 'Please deploy Firebase security rules first.'
      }
      
      setError(errorMessage)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kahoot-purple via-kahoot-blue to-kahoot-pink flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-white/80 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to home
        </Link>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-kahoot-purple rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-white">K!</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Join a Kahoot!</h1>
          </div>

          {step === 'pin' && (
            <form onSubmit={handlePinSubmit} className="space-y-6">
              <div>
                <label htmlFor="gamePin" className="block text-sm font-medium text-gray-700 mb-2">
                  Game PIN
                </label>
                <Input
                  id="gamePin"
                  type="text"
                  value={gamePin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                    setGamePin(value)
                  }}
                  placeholder="Enter game PIN"
                  className="text-center text-2xl font-bold tracking-widest h-16"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Enter the 6-digit PIN displayed on your teacher&apos;s screen
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 text-lg"
                disabled={gamePin.length !== 6 || isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Connecting...
                  </div>
                ) : (
                  <>
                    <Gamepad2 className="w-5 h-5 mr-2" />
                    Enter Game
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-gray-500">
                <p>Enter a 6-digit PIN from your teacher&apos;s screen to join the game</p>
              </div>
            </form>
          )}

          {step === 'nickname' && (
            <form onSubmit={handleNicknameSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">Game found! PIN: <span className="font-bold">{gamePin}</span></p>
              </div>

              <div>
                <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
                  Your nickname
                </label>
                <Input
                  id="nickname"
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value.slice(0, 20))}
                  placeholder="Enter your nickname"
                  className="text-center text-xl font-semibold h-14"
                  maxLength={20}
                  required
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  This is how other players will see you
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="space-y-3">
                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg"
                  disabled={nickname.trim().length < 2 || isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Joining...
                    </div>
                  ) : (
                    <>
                      <Users className="w-5 h-5 mr-2" />
                      Join Game
                    </>
                  )}
                </Button>

                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setStep('pin')}
                  disabled={isLoading}
                >
                  Change PIN
                </Button>
              </div>
            </form>
          )}

          {step === 'waiting' && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">You&apos;re in!</h2>
                <p className="text-gray-600 mb-1">Welcome, <span className="font-semibold">{nickname}</span></p>
                <p className="text-sm text-gray-500">Waiting for the game to start...</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  You&apos;ll be redirected to the game lobby in a moment.
                  <br />
                  Get ready to play!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 text-center text-white/80">
          <h3 className="font-semibold mb-2">How to play:</h3>
          <ul className="text-sm space-y-1">
            <li>1. Enter the game PIN from your teacher&apos;s screen</li>
            <li>2. Choose a nickname</li>
            <li>3. Wait for the game to start</li>
            <li>4. Answer questions on your device</li>
          </ul>
        </div>
      </div>
    </div>
  )
}