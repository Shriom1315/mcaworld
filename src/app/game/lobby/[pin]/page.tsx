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
    <div className="min-h-screen">
      {/* Retro OS Desktop Taskbar */}
      <div className="bg-gray-300 border-b-2 border-gray-600 px-2 py-1 flex items-center justify-between text-sm font-mono">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-gray-200 border border-gray-400 px-2 py-1">
            <Users className="w-4 h-4" />
            <span>GameLobby.exe</span>
          </div>
          <div className="text-xs text-gray-600">PIN: {gamePin}</div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{isConnected ? 'CONNECTED' : 'DISCONNECTED'}</span>
          </div>
          <button
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            className="bg-gray-200 border border-gray-400 px-2 py-1 text-xs hover:bg-gray-100"
          >
            {isSoundEnabled ? '♪' : '♪̸'}
          </button>
          <div className="bg-gray-200 border border-gray-400 px-2 py-1 text-xs">
            12:34 PM
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-[calc(100vh-32px)] flex items-center justify-center">
          <div className="retro-window p-8">
            <div className="retro-window-header">
              <span>Loading Game</span>
            </div>
            <div className="p-6 text-center bg-white">
              <div className="w-16 h-16 border-4 border-gray-400 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
              <div className="font-mono text-sm text-gray-700">CONNECTING TO GAME...</div>
              <div className="font-mono text-xs text-gray-500 mt-1">PIN: {gamePin}</div>
            </div>
          </div>
        </div>
      ) : !quiz || !game ? (
        <div className="h-[calc(100vh-32px)] flex items-center justify-center">
          <div className="retro-window p-8">
            <div className="retro-window-header">
              <span>Error - Game Not Found</span>
            </div>
            <div className="p-6 text-center bg-white">
              <div className="w-16 h-16 bg-red-200 border-2 border-red-600 flex items-center justify-center mx-auto mb-4 font-mono text-2xl text-red-600">
                !
              </div>
              <h2 className="font-mono text-lg font-bold text-gray-900 mb-2">GAME NOT FOUND</h2>
              <p className="font-mono text-sm text-gray-600 mb-4">PIN: {gamePin} is invalid or expired</p>
              <button
                onClick={() => window.location.href = '/join'}
                className="px-6 py-2 bg-blue-400 hover:bg-blue-300 border-2 border-gray-600 font-mono font-bold"
                style={{boxShadow: '2px 2px 4px rgba(0,0,0,0.3)'}}
              >
                [BACK] Try Again
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-[calc(100vh-32px)] flex">
          {/* Main Game Lobby Window */}
          <div className="flex-1 retro-window m-2">
            <div className="retro-window-header">
              <span>Game Lobby - {quiz?.title || 'Loading...'}</span>
              <div className="retro-window-controls">
                <div className="retro-window-control minimize">_</div>
                <div className="retro-window-control maximize">□</div>
              </div>
            </div>
            
            <div className="bg-white h-full flex">
              {showAvatarSelection ? (
                /* Avatar Selection Interface */
                <div className="flex-1 p-6">
                  {/* Player Info Panel */}
                  <div className="retro-window mb-6">
                    <div className="retro-window-header">
                      <span>Player Profile Setup</span>
                    </div>
                    <div className="p-4 bg-white text-center">
                      <div className="w-24 h-24 bg-gray-100 border-2 border-gray-400 mx-auto mb-4 relative overflow-hidden">
                        <Avatar avatarId={selectedAvatar.id} size="xl" showBorder={false} className="w-full h-full" />
                        {selectedAccessory.emoji && (
                          <span className="absolute top-1 right-1 text-lg">{selectedAccessory.emoji}</span>
                        )}
                      </div>
                      <div className="font-mono text-lg font-bold text-gray-900 mb-1">{nickname}</div>
                      <div className="font-mono text-xs text-gray-600">PLAYER ID: #{Math.random().toString(36).substr(2, 6).toUpperCase()}</div>
                      <div className="font-mono text-xs text-gray-500 mt-2">STATUS: WAITING FOR GAME</div>
                    </div>
                  </div>

                  {/* Avatar Customization */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Character Selection */}
                    <div className="retro-window">
                      <div className="retro-window-header">
                        <span>Select Character</span>
                      </div>
                      <div className="p-3 bg-white h-48 overflow-y-auto">
                        <div className="grid grid-cols-2 gap-2">
                          {avatarOptions.map((avatar) => (
                            <button
                              key={avatar.id}
                              onClick={() => setSelectedAvatar(avatar)}
                              className={`w-full aspect-square border-2 p-2 transition-all ${
                                selectedAvatar.id === avatar.id 
                                  ? 'border-blue-500 bg-blue-100' 
                                  : 'border-gray-400 bg-gray-50 hover:bg-gray-100'
                              }`}
                              style={{boxShadow: '1px 1px 2px rgba(0,0,0,0.2)'}}
                            >
                              <Avatar avatarId={avatar.id} size="md" showBorder={false} className="w-full h-full" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Accessory Selection */}
                    <div className="retro-window">
                      <div className="retro-window-header">
                        <span>Select Accessory</span>
                      </div>
                      <div className="p-3 bg-white h-48 overflow-y-auto">
                        <div className="grid grid-cols-2 gap-2">
                          {accessoryOptions.map((accessory) => (
                            <button
                              key={accessory.id}
                              onClick={() => setSelectedAccessory(accessory)}
                              className={`w-full aspect-square border-2 flex items-center justify-center text-2xl transition-all ${
                                selectedAccessory.id === accessory.id 
                                  ? 'border-blue-500 bg-blue-100' 
                                  : 'border-gray-400 bg-gray-50 hover:bg-gray-100'
                              }`}
                              style={{boxShadow: '1px 1px 2px rgba(0,0,0,0.2)'}}
                            >
                              {accessory.emoji || '∅'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Done Button */}
                  <div className="mt-6">
                    <button
                      onClick={handleAvatarDone}
                      className="w-full px-6 py-3 bg-green-400 hover:bg-green-300 border-2 border-gray-600 font-mono font-bold text-lg"
                      style={{boxShadow: '2px 2px 4px rgba(0,0,0,0.3)'}}
                    >
                      [CONFIRM] Ready to Play
                    </button>
                  </div>
                </div>
              ) : !gameStarting ? (
                /* Waiting Room Interface */
                <div className="flex-1 flex flex-col">
                  {/* Player Status */}
                  <div className="p-6 border-b-2 border-gray-300">
                    <div className="flex items-center justify-center space-x-4">
                      <div className="w-16 h-16 bg-gray-100 border-2 border-gray-400 relative overflow-hidden">
                        <Avatar avatarId={selectedAvatar.id} size="lg" showBorder={false} className="w-full h-full" />
                        {selectedAccessory.emoji && (
                          <span className="absolute top-0 right-0 text-sm">{selectedAccessory.emoji}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-mono text-xl font-bold text-gray-900">{nickname}</div>
                        <div className="font-mono text-sm text-green-600">✓ CONNECTED TO GAME</div>
                        <div className="font-mono text-xs text-gray-500">PIN: {gamePin}</div>
                      </div>
                    </div>
                  </div>

                  {/* Game Info */}
                  <div className="flex-1 p-6">
                    <div className="retro-window h-full">
                      <div className="retro-window-header">
                        <span>Game Information</span>
                      </div>
                      <div className="p-6 bg-white h-full flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-yellow-200 border-2 border-gray-600 flex items-center justify-center mx-auto mb-6 font-mono text-3xl animate-pulse">
                          ⏳
                        </div>
                        <h2 className="font-mono text-2xl font-bold text-gray-900 mb-4">WAITING FOR HOST</h2>
                        <div className="space-y-2 font-mono text-sm text-gray-600">
                          <div>Quiz: {quiz?.title}</div>
                          <div>Questions: {quiz?.questions?.length || 0}</div>
                          <div>Players: {mockPlayers.length} connected</div>
                        </div>
                        <div className="mt-6 p-3 bg-gray-100 border border-gray-300 font-mono text-xs text-gray-600">
                          The host will start the game soon...
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Game Starting Animation */
                <div className="flex-1 flex items-center justify-center">
                  <div className="retro-window p-8">
                    <div className="retro-window-header">
                      <span>Game Starting</span>
                    </div>
                    <div className="p-8 text-center bg-white">
                      <div className="w-24 h-24 bg-red-400 border-2 border-gray-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                        <span className="font-mono text-3xl font-bold text-white">3</span>
                      </div>
                      <h1 className="font-mono text-3xl font-bold text-gray-900 mb-4 animate-bounce">
                        GAME STARTING!
                      </h1>
                      <div className="font-mono text-sm text-gray-600">
                        Loading questions...
                      </div>
                      <div className="mt-4">
                        <div className="retro-progress-bar">
                          <div className="retro-progress-fill" style={{width: '100%', animation: 'progress 2s ease-in-out'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Connected Players */}
          <div className="w-64 retro-window m-2">
            <div className="retro-window-header">
              <span>Players ({mockPlayers.length})</span>
            </div>
            <div className="p-3 bg-white h-full overflow-y-auto">
              <div className="space-y-2">
                {mockPlayers.map((player, index) => (
                  <div
                    key={player.id}
                    className="p-2 border border-gray-300 bg-gray-50 flex items-center space-x-2"
                    style={{boxShadow: '1px 1px 1px rgba(0,0,0,0.1)'}}
                  >
                    <div className="w-8 h-8 bg-gray-200 border border-gray-400 flex items-center justify-center text-xs font-mono">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-xs truncate">{player.nickname}</div>
                      <div className="font-mono text-xs text-green-600">● Online</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-2 bg-yellow-100 border border-yellow-400">
                <div className="font-mono text-xs text-gray-700">SYSTEM INFO:</div>
                <div className="font-mono text-xs text-gray-600 mt-1">
                  • Connection: Stable<br/>
                  • Latency: 45ms<br/>
                  • Server: Online
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}