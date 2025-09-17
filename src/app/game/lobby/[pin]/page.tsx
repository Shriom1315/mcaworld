'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Users, Crown, Wifi, WifiOff, Volume2, VolumeX, Check } from 'lucide-react'
import { collection, doc, getDoc, getDocs, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { COLLECTIONS } from '@/types/firebase'
import AvatarSelector, { avatarOptions } from '@/components/avatar/AvatarSelector'
import Avatar from '@/components/avatar/Avatar'
import BitWiseLoader from '@/components/ui/BitWiseLoader'



// Accessory options (keeping the emoji accessories for fun)
const accessoryOptions = [
  { id: 'none', emoji: '', name: 'None' },
  { id: 'hat', emoji: '🎩', name: 'Hat' },
  { id: 'glasses', emoji: '🕶️', name: 'Glasses' },
  { id: 'crown', emoji: '👑', name: 'Crown' },
  { id: 'star', emoji: '⭐', name: 'Star' },
  { id: 'fire', emoji: '🔥', name: 'Fire' },
  { id: 'lightning', emoji: '⚡', name: 'Lightning' }
]

// Mock quiz data
const mockQuiz = {
  title: 'Cyber Safety Quiz',
  description: 'Test your knowledge about online safety'
}

// Mock player data
const mockPlayers = [
  { id: '1', nickname: 'MathWiz123', joinedAt: new Date() },
  { id: '2', nickname: 'ScienceGirl', joinedAt: new Date() },
  { id: '3', nickname: 'HistoryBuff', joinedAt: new Date() },
  { id: '4', nickname: 'BookLover', joinedAt: new Date() },
  { id: '5', nickname: 'ArtistKid', joinedAt: new Date() },
  { id: '6', nickname: 'TechNinja', joinedAt: new Date() },
]

export default function GameLobbyPage() {
  const searchParams = useSearchParams()
  const params = useParams()
  const gamePin = params.pin as string
  const nickname = searchParams.get('nickname') || 'Player'
  
  // Real data state
  const [quiz, setQuiz] = useState<any>(null)
  const [game, setGame] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  const [isConnected, setIsConnected] = useState(true)
  const [isSoundEnabled, setIsSoundEnabled] = useState(true)
  const [gameStarting, setGameStarting] = useState(false)
  const [showAvatarSelection, setShowAvatarSelection] = useState(true)
  const [selectedAvatar, setSelectedAvatar] = useState(avatarOptions[0])
  const [selectedAccessory, setSelectedAccessory] = useState(accessoryOptions[0])
  const [avatarTab, setAvatarTab] = useState<'character' | 'accessory'>('character')

  // Clear any previous session data on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Only keep current game data, clear any previous game sessions
      const currentPin = params.pin
      const storedPin = localStorage.getItem('kahoot_current_game_pin')
      
      if (storedPin !== currentPin) {
        // Different game, clear all stored data
        localStorage.clear()
        localStorage.setItem('kahoot_current_game_pin', currentPin as string)
      }
    }
  }, [params.pin])

  // Fetch game and quiz data
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        // Find game by PIN
        const gamesRef = collection(db, COLLECTIONS.GAMES)
        const gameQuery = query(gamesRef, where('pin', '==', gamePin))
        const gameSnapshot = await getDocs(gameQuery)
        
        if (gameSnapshot.empty) {
          console.error('Game not found with PIN:', gamePin)
          alert('Game not found. Please check the PIN.')
          return
        }
        
        const gameDoc = gameSnapshot.docs[0]
        const gameData = { id: gameDoc.id, ...gameDoc.data() } as any
        setGame(gameData)
        
        // Fetch quiz data
        const quizRef = doc(db, COLLECTIONS.QUIZZES, gameData.quiz_id)
        const quizDoc = await getDoc(quizRef)
        
        if (quizDoc.exists()) {
          const quizData = { id: quizDoc.id, ...quizDoc.data() }
          setQuiz(quizData)
        } else {
          console.error('Quiz not found with ID:', gameData.quiz_id)
          alert('Quiz not found')
        }
      } catch (error) {
        console.error('Error fetching game data:', error)
        alert('Error loading game')
      } finally {
        setLoading(false)
      }
    }

    fetchGameData()
  }, [gamePin])

  // Real-time listener for game state changes
  useEffect(() => {
    if (!game?.id) return

    console.log('Setting up real-time game state listener for player lobby:', game.id)
    
    const gameRef = doc(db, COLLECTIONS.GAMES, game.id)
    
    const unsubscribe = onSnapshot(gameRef, (snapshot) => {
      if (snapshot.exists()) {
        const gameData: any = { id: snapshot.id, ...snapshot.data() }
        console.log('Real-time game state update in lobby:', gameData)
        
        // Check if game has started
        if (gameData.status === 'active' && gameData.game_phase === 'question') {
          console.log('Game has started! Redirecting to game page...')
          setGameStarting(true)
          
          // Redirect to the actual game page after a short delay
          setTimeout(() => {
            const searchParams = new URLSearchParams({
              nickname: nickname,
              gameId: game.id,
              pin: gamePin
            })
            window.location.href = `/game/play/${gamePin}?${searchParams.toString()}`
          }, 2000)
        }
        
        setGame(gameData)
      }
    }, (error) => {
      console.error('Error listening to game state:', error)
    })

    return () => {
      console.log('Cleaning up game state listener in lobby')
      unsubscribe()
    }
  }, [game?.id, nickname, gamePin])

  // Remove the old mock simulation - real-time listener handles game start

  const handleAvatarDone = () => {
    setShowAvatarSelection(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kahoot-purple via-kahoot-blue to-kahoot-pink relative overflow-hidden">
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center text-white">
            <BitWiseLoader size="lg" className="mb-6" text="Joining game..." />
          </div>
        </div>
      ) : !quiz || !game ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-4">Game Not Found</h1>
            <p className="text-gray-300 mb-6">The game with PIN {gamePin} could not be found.</p>
            <button onClick={() => window.location.href = '/join'} className="btn-primary">
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Decorative flowing background elements */}
          <div className="absolute inset-0">
            <svg className="w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="none">
              <defs>
                <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="#ff006e" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#8338ec" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              <path d="M0,150 Q200,100 400,120 T800,150 L800,600 L0,600 Z" fill="url(#wave1)" />
              <path d="M0,300 Q300,250 600,280 T800,300 L800,600 L0,600 Z" fill="rgba(255,0,110,0.1)" />
              <path d="M0,450 Q150,400 300,420 T600,450 Q700,480 800,450 L800,600 L0,600 Z" fill="rgba(0,212,255,0.15)" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
            {showAvatarSelection ? (
              // Avatar Selection Screen
              <div className="w-full max-w-md">
                {/* Profile Display */}
                <div className="text-center mb-8">
                  <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-4 relative overflow-hidden">
                    <Avatar avatarId={selectedAvatar.id} size="xl" showBorder={false} className="w-full h-full" />
                    {selectedAccessory.emoji && (
                      <span className="absolute top-2 right-2 text-2xl">{selectedAccessory.emoji}</span>
                    )}
                  </div>
                  <h1 className="text-4xl font-bold text-white mb-2">{nickname}</h1>
                  <p className="text-lg text-white/90 uppercase tracking-wide font-medium">{quiz?.title || 'Quiz Topic'}</p>
                  <p className="text-sm text-white/70">You&apos;re in! See your nickname on screen?</p>
                </div>

                {/* Avatar Selection */}
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 mb-6">
                  {/* Tabs */}
                  <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setAvatarTab('character')}
                      className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-colors ${
                        avatarTab === 'character' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                      }`}
                    >
                      Character
                    </button>
                    <button
                      onClick={() => setAvatarTab('accessory')}
                      className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-colors ${
                        avatarTab === 'accessory' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                      }`}
                    >
                      Accessory
                    </button>
                  </div>

                  {/* Character Selection */}
                  {avatarTab === 'character' && (
                    <AvatarSelector 
                      selectedAvatar={selectedAvatar}
                      onAvatarSelect={setSelectedAvatar}
                    />
                  )}

                  {/* Accessory Selection */}
                  {avatarTab === 'accessory' && (
                    <div className="grid grid-cols-3 gap-3">
                      {accessoryOptions.map((accessory) => (
                        <button
                          key={accessory.id}
                          onClick={() => setSelectedAccessory(accessory)}
                          className={`w-full aspect-square rounded-xl flex items-center justify-center text-3xl transition-all ${
                            selectedAccessory.id === accessory.id 
                              ? 'bg-kahoot-purple text-white scale-105' 
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          {accessory.emoji || '☓'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Done Button */}
                <Button onClick={handleAvatarDone} className="w-full bg-white text-gray-900 hover:bg-gray-100 font-semibold py-3 text-lg">
                  Done
                </Button>
              </div>
            ) : !gameStarting ? (
              // Waiting Screen
              <div className="text-center">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 relative overflow-hidden">
                  <Avatar avatarId={selectedAvatar.id} size="lg" showBorder={false} className="w-full h-full" />
                  {selectedAccessory.emoji && (
                    <span className="absolute top-1 right-1 text-lg">{selectedAccessory.emoji}</span>
                  )}
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">You&apos;re in!</h1>
                <p className="text-xl text-white/90 mb-2">{nickname}</p>
                <p className="text-lg text-white/70">Waiting for the game to start...</p>
              </div>
            ) : (
              // Game Starting Animation
              <div className="text-center">
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl animate-pulse">
                  <span className="text-6xl font-bold text-kahoot-purple">3</span>
                </div>
                <h1 className="text-6xl font-bold text-white mb-4 animate-bounce">
                  Game Starting!
                </h1>
                <p className="text-xl text-white/90">
                  Get ready to play...
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}