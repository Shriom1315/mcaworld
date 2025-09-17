'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { COLLECTIONS } from '@/types/firebase'
import { Trophy, Crown, Star, Zap, Award, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import Avatar from '@/components/avatar/Avatar'

interface LeaderboardRevealProps {
  gameId: string
  playerNickname: string
  currentQuestionIndex: number
  onComplete?: () => void
  className?: string
}

interface PlayerData {
  id: string
  nickname: string
  score: number
  previousScore: number
  position: number
  previousPosition: number
  isCorrect: boolean
  pointsEarned: number
  avatarId: string
  streak: number
}

export default function LeaderboardReveal({
  gameId,
  playerNickname,
  currentQuestionIndex,
  onComplete,
  className = ''
}: LeaderboardRevealProps) {
  const [players, setPlayers] = useState<PlayerData[]>([])
  const [revealPhase, setRevealPhase] = useState<'building' | 'positions' | 'celebrate' | 'complete'>('building')
  const [revealedCount, setRevealedCount] = useState(0)
  const [currentPlayer, setCurrentPlayer] = useState<PlayerData | null>(null)

  useEffect(() => {
    if (!gameId) return

    const gameSessionsRef = collection(db, COLLECTIONS.GAME_SESSIONS)
    const q = query(gameSessionsRef, where('gameId', '==', gameId))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allPlayers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[]

      const playersData: PlayerData[] = allPlayers.map((player, index) => {
        const currentAnswer = player.answers?.[currentQuestionIndex]
        const previousScore = player.score - (currentAnswer?.points || 0)
        
        return {
          id: player.id,
          nickname: player.nickname,
          score: player.score || 0,
          previousScore,
          position: 0,
          previousPosition: 0,
          isCorrect: currentAnswer?.isCorrect || false,
          pointsEarned: currentAnswer?.points || 0,
          avatarId: player.avatarId || ['boy', 'girl', 'geek', 'woman', 'superhero', 'chinese'][index % 6],
          streak: player.streak || 0
        }
      })

      // Calculate positions
      const sortedByCurrentScore = [...playersData].sort((a, b) => b.score - a.score)
      sortedByCurrentScore.forEach((player, index) => {
        player.position = index + 1
      })

      const sortedByPreviousScore = [...playersData].sort((a, b) => b.previousScore - a.previousScore)
      sortedByPreviousScore.forEach((player, index) => {
        const currentPlayerData = playersData.find(p => p.id === player.id)
        if (currentPlayerData) currentPlayerData.previousPosition = index + 1
      })

      // Sort final by current position for reveal
      const finalSorted = sortedByCurrentScore
      setPlayers(finalSorted)
      
      // Find current player
      const current = finalSorted.find(p => p.nickname === playerNickname)
      setCurrentPlayer(current || null)

      // Start animation sequence
      if (revealPhase === 'building') {
        setTimeout(() => setRevealPhase('positions'), 1500)
      }
    }, (error) => {
      console.error('Error listening to leaderboard reveal:', error)
    })

    return () => unsubscribe()
  }, [gameId, currentQuestionIndex, playerNickname, revealPhase])

  // Auto-reveal positions one by one
  useEffect(() => {
    if (revealPhase === 'positions' && revealedCount < players.length) {
      const timer = setTimeout(() => {
        setRevealedCount(prev => prev + 1)
      }, players.length <= 3 ? 800 : 500) // Slower for fewer players
      return () => clearTimeout(timer)
    } else if (revealPhase === 'positions' && revealedCount >= players.length) {
      const timer = setTimeout(() => {
        setRevealPhase('celebrate')
      }, 1000)
      return () => clearTimeout(timer)
    } else if (revealPhase === 'celebrate') {
      const timer = setTimeout(() => {
        setRevealPhase('complete')
        onComplete?.()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [revealPhase, revealedCount, players.length, onComplete])

  const getPositionChange = (current: number, previous: number) => {
    if (current < previous) return { type: 'up', icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500' }
    if (current > previous) return { type: 'down', icon: TrendingDown, color: 'text-red-400', bg: 'bg-red-500' }
    return { type: 'same', icon: Minus, color: 'text-blue-400', bg: 'bg-blue-500' }
  }

  const getPodiumColor = (position: number) => {
    switch (position) {
      case 1: return 'bg-gradient-to-t from-yellow-500 to-yellow-300'
      case 2: return 'bg-gradient-to-t from-gray-400 to-gray-200'
      case 3: return 'bg-gradient-to-t from-amber-600 to-amber-400'
      default: return 'bg-gradient-to-t from-blue-500 to-blue-300'
    }
  }

  if (revealPhase === 'building') {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 ${className}`}>
        <div className="text-center text-white">
          <div className="mb-8">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-leaderboard-suspense">
              <Trophy className="w-12 h-12 text-yellow-400 animate-pulse" />
            </div>
            <h1 className="text-5xl font-bold mb-4 animate-pulse bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              WHO'S ON TOP?
            </h1>
            <p className="text-xl text-white/80 mb-6 animate-fade-in">Building suspense...</p>
            <div className="flex justify-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-8 bg-white rounded-full animate-pulse"
                  style={{ 
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '1s'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 ${className}`}>
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-pulse">
            🏆 LEADERBOARD 🏆
          </h1>
          {currentPlayer && (
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 max-w-xs mx-auto">
              <div className="text-white text-lg font-semibold">
                You're #{currentPlayer.position}!
              </div>
              {currentPlayer.position <= 3 && (
                <div className="text-yellow-300 text-sm animate-pulse">
                  You're on the podium! 🎉
                </div>
              )}
            </div>
          )}
        </div>

        {/* Top 3 Podium */}
        {players.length >= 3 && (
          <div className="flex items-end justify-center space-x-4 mb-8">
            {/* 2nd Place */}
            <div className="text-center">
              {revealedCount >= players.length - 1 && (
                <div className="animate-leaderboard-drop" style={{ animationDelay: '200ms' }}>
                  <div className="relative mb-4">
                    <div className="w-16 h-16 mx-auto mb-2">
                      <Avatar avatarId={players[1]?.avatarId} size="lg" className="w-full h-full" />
                    </div>
                    <div className="text-white font-bold text-sm">{players[1]?.nickname}</div>
                    <div className="text-yellow-400 font-bold text-lg">{players[1]?.score}</div>
                    
                    {/* Position change */}
                    {(() => {
                      const change = getPositionChange(players[1]?.position, players[1]?.previousPosition)
                      const ChangeIcon = change.icon
                      return (
                        <div className={`text-xs font-bold ${change.color} animate-pulse`}>
                          <ChangeIcon className="w-3 h-3 inline mr-1" />
                          {change.type.toUpperCase()}
                        </div>
                      )
                    })()}
                  </div>
                  <div className={`h-24 w-20 ${getPodiumColor(2)} rounded-t-lg flex items-center justify-center text-white font-bold text-xl shadow-lg animate-podium-rise`}>
                    2
                  </div>
                </div>
              )}
            </div>

            {/* 1st Place */}
            <div className="text-center">
              {revealedCount >= players.length && (
                <div className="animate-leaderboard-drop scale-110" style={{ animationDelay: '400ms' }}>
                  <div className="relative mb-4">
                    <Crown className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 text-yellow-400 animate-crown-float" />
                    <div className="w-20 h-20 mx-auto mb-2">
                      <Avatar avatarId={players[0]?.avatarId} size="lg" className="w-full h-full" />
                    </div>
                    <div className="text-white font-bold text-lg">{players[0]?.nickname}</div>
                    <div className="text-yellow-400 font-bold text-2xl animate-pulse">{players[0]?.score}</div>
                    
                    {/* Position change */}
                    {(() => {
                      const change = getPositionChange(players[0]?.position, players[0]?.previousPosition)
                      const ChangeIcon = change.icon
                      return (
                        <div className={`text-sm font-bold ${change.color} animate-pulse`}>
                          <ChangeIcon className="w-4 h-4 inline mr-1" />
                          {change.type.toUpperCase()}
                        </div>
                      )
                    })()}
                  </div>
                  <div className={`h-32 w-24 ${getPodiumColor(1)} rounded-t-lg flex items-center justify-center text-white font-bold text-2xl shadow-lg animate-podium-rise animate-pulse`}>
                    1
                  </div>
                </div>
              )}
            </div>

            {/* 3rd Place */}
            <div className="text-center">
              {revealedCount >= players.length - 2 && players[2] && (
                <div className="animate-leaderboard-drop">
                  <div className="relative mb-4">
                    <div className="w-14 h-14 mx-auto mb-2">
                      <Avatar avatarId={players[2]?.avatarId} size="lg" className="w-full h-full" />
                    </div>
                    <div className="text-white font-bold text-sm">{players[2]?.nickname}</div>
                    <div className="text-yellow-400 font-bold text-lg">{players[2]?.score}</div>
                    
                    {/* Position change */}
                    {(() => {
                      const change = getPositionChange(players[2]?.position, players[2]?.previousPosition)
                      const ChangeIcon = change.icon
                      return (
                        <div className={`text-xs font-bold ${change.color} animate-pulse`}>
                          <ChangeIcon className="w-3 h-3 inline mr-1" />
                          {change.type.toUpperCase()}
                        </div>
                      )
                    })()}
                  </div>
                  <div className={`h-20 w-18 ${getPodiumColor(3)} rounded-t-lg flex items-center justify-center text-white font-bold text-lg shadow-lg animate-podium-rise`}>
                    3
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Remaining Players List */}
        {players.length > 3 && (
          <div className="w-full max-w-md space-y-2">
            {players.slice(3).map((player, index) => {
              const actualIndex = index + 3
              const isRevealed = revealedCount > players.length - actualIndex - 1
              
              if (!isRevealed) return null

              const change = getPositionChange(player.position, player.previousPosition)
              const ChangeIcon = change.icon

              return (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-lg animate-slide-in"
                  style={{ animationDelay: `${actualIndex * 100}ms` }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {player.position}
                    </div>
                    <div className="w-10 h-10">
                      <Avatar avatarId={player.avatarId} size="sm" className="w-full h-full" />
                    </div>
                    <div>
                      <div className="text-white font-semibold text-sm">{player.nickname}</div>
                      <div className={`text-xs font-bold ${change.color}`}>
                        <ChangeIcon className="w-3 h-3 inline mr-1" />
                        {change.type.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <div className="text-yellow-400 font-bold text-lg">
                    {player.score}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Celebration Phase */}
        {revealPhase === 'celebrate' && (
          <div className="fixed inset-0 pointer-events-none">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl animate-bounce">🎉</div>
            </div>
            {/* Confetti */}
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-10px',
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random()}s`
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}