'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { COLLECTIONS } from '@/types/firebase'
import { Trophy, Crown, Star, Zap, Target, Users, Award } from 'lucide-react'
import Avatar from '@/components/avatar/Avatar'

interface ResultsScreenProps {
  gameId: string
  currentQuestionIndex: number
  onAnimationComplete?: () => void
  className?: string
}

interface PlayerResult {
  id: string
  nickname: string
  score: number
  previousScore: number
  isCorrect: boolean
  timeToAnswer: number
  pointsEarned: number
  position: number
  previousPosition: number
  avatarId: string
}

export default function ResultsScreen({ 
  gameId, 
  currentQuestionIndex, 
  onAnimationComplete,
  className = '' 
}: ResultsScreenProps) {
  const [players, setPlayers] = useState<PlayerResult[]>([])
  const [animationPhase, setAnimationPhase] = useState<'loading' | 'reveal' | 'leaderboard' | 'complete'>('loading')
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (!gameId) return

    const gameSessionsRef = collection(db, COLLECTIONS.GAME_SESSIONS)
    const q = query(gameSessionsRef, where('gameId', '==', gameId))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allPlayers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[]

      // Calculate results for current question
      const playersWithResults: PlayerResult[] = allPlayers.map((player, index) => {
        const currentAnswer = player.answers?.[currentQuestionIndex]
        const previousScore = player.score - (currentAnswer?.points || 0)
        
        return {
          id: player.id,
          nickname: player.nickname,
          score: player.score || 0,
          previousScore,
          isCorrect: currentAnswer?.isCorrect || false,
          timeToAnswer: currentAnswer?.timeToAnswer || 0,
          pointsEarned: currentAnswer?.points || 0,
          position: 0, // Will be calculated after sorting
          previousPosition: 0, // Will be calculated after sorting
          avatarId: player.avatarId || ['boy', 'girl', 'geek', 'woman', 'superhero', 'chinese'][index % 6]
        }
      })

      // Sort by current score and assign positions
      const sortedByCurrentScore = [...playersWithResults].sort((a, b) => b.score - a.score)
      sortedByCurrentScore.forEach((player, index) => {
        player.position = index + 1
      })

      // Sort by previous score and assign previous positions  
      const sortedByPreviousScore = [...playersWithResults].sort((a, b) => b.previousScore - a.previousScore)
      sortedByPreviousScore.forEach((player, index) => {
        const currentPlayer = playersWithResults.find(p => p.id === player.id)
        if (currentPlayer) currentPlayer.previousPosition = index + 1
      })

      setPlayers(sortedByCurrentScore.slice(0, 5)) // Top 5 for animation

      // Start animation sequence
      setTimeout(() => setAnimationPhase('reveal'), 500)
      setTimeout(() => setAnimationPhase('leaderboard'), 2000)
      setTimeout(() => {
        setAnimationPhase('complete')
        setShowConfetti(true)
        onAnimationComplete?.()
      }, 4000)
      
    }, (error) => {
      console.error('Error listening to results:', error)
    })

    return () => unsubscribe()
  }, [gameId, currentQuestionIndex, onAnimationComplete])

  const getPositionChangeIcon = (current: number, previous: number) => {
    if (current < previous) return { icon: '↗', color: 'text-green-400', label: 'UP!' }
    if (current > previous) return { icon: '↘', color: 'text-red-400', label: 'DOWN' }
    return { icon: '→', color: 'text-blue-400', label: 'SAME' }
  }

  const getPodiumHeight = (position: number) => {
    switch (position) {
      case 1: return 'h-32'
      case 2: return 'h-24'
      case 3: return 'h-20'
      default: return 'h-16'
    }
  }

  const getPodiumColor = (position: number) => {
    switch (position) {
      case 1: return 'bg-gradient-to-t from-yellow-600 to-yellow-400'
      case 2: return 'bg-gradient-to-t from-gray-500 to-gray-300'
      case 3: return 'bg-gradient-to-t from-amber-700 to-amber-500'
      default: return 'bg-gradient-to-t from-blue-600 to-blue-400'
    }
  }

  if (animationPhase === 'loading') {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[400px] ${className}`}>
        <div className="text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Target className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Calculating Results...</h2>
          <div className="flex justify-center space-x-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 bg-white rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (animationPhase === 'reveal') {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[400px] ${className}`}>
        <div className="text-center">
          <div className="mb-8">
            <Trophy className="w-24 h-24 text-yellow-400 mx-auto animate-bounce" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-6 animate-pulse">
            🎉 Question Results! 🎉
          </h2>
          
          {/* Show correct/incorrect for each player */}
          <div className="grid grid-cols-1 gap-4 max-w-md">
            {players.map((player, index) => (
              <div
                key={player.id}
                className={`
                  flex items-center justify-between p-4 rounded-lg transition-all duration-1000 transform
                  ${player.isCorrect ? 'bg-green-500/20 border-green-500' : 'bg-red-500/20 border-red-500'}
                  border-2 animate-slide-in
                `}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="flex items-center space-x-3">
                  <Avatar avatarId={player.avatarId} size="sm" />
                  <span className="text-white font-medium">{player.nickname}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {player.isCorrect ? (
                    <>
                      <div className="text-green-400 font-bold">+{player.pointsEarned}</div>
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        ✓
                      </div>
                    </>
                  ) : (
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      ✗
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="text-center p-8">
        <h2 className="text-4xl font-bold text-white mb-8 animate-bounce">
          🏆 LEADERBOARD UPDATE! 🏆
        </h2>

        {/* Podium View for Top 3 */}
        <div className="flex items-end justify-center space-x-4 mb-8">
          {players.slice(0, 3).map((player, index) => {
            const position = index + 1
            const change = getPositionChangeIcon(player.position, player.previousPosition)
            
            return (
              <div
                key={player.id}
                className={`
                  text-center transform transition-all duration-1000 animate-slide-up
                  ${position === 1 ? 'scale-110' : 'scale-100'}
                `}
                style={{ animationDelay: `${(2 - index) * 300}ms` }}
              >
                {/* Avatar and Info */}
                <div className="mb-4">
                  <div className="relative">
                    <div className="w-16 h-16 mx-auto mb-2">
                      <Avatar avatarId={player.avatarId} size="lg" className="w-full h-full" />
                    </div>
                    {position === 1 && (
                      <Crown className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 text-yellow-400 animate-pulse" />
                    )}
                  </div>
                  
                  <div className="text-white font-bold text-sm mb-1">{player.nickname}</div>
                  <div className="text-yellow-400 font-bold text-lg">{player.score}</div>
                  
                  {/* Position Change */}
                  <div className={`text-xs font-bold ${change.color} animate-pulse`}>
                    {change.icon} {change.label}
                  </div>
                </div>

                {/* Podium */}
                <div className={`
                  ${getPodiumHeight(position)} w-20 ${getPodiumColor(position)} 
                  rounded-t-lg flex items-center justify-center text-white font-bold text-xl
                  shadow-lg transform transition-all duration-1000
                  ${position === 1 ? 'animate-pulse' : ''}
                `}>
                  {position}
                </div>
              </div>
            )
          })}
        </div>

        {/* Remaining Players */}
        {players.length > 3 && (
          <div className="max-w-2xl mx-auto space-y-2">
            {players.slice(3).map((player, index) => {
              const change = getPositionChangeIcon(player.position, player.previousPosition)
              
              return (
                <div
                  key={player.id}
                  className={`
                    flex items-center justify-between p-3 bg-gray-700/50 rounded-lg
                    transform transition-all duration-500 animate-slide-in
                  `}
                  style={{ animationDelay: `${(index + 3) * 200}ms` }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold">
                      {player.position}
                    </div>
                    <Avatar avatarId={player.avatarId} size="sm" />
                    <span className="text-white font-medium">{player.nickname}</span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className={`text-xs font-bold ${change.color}`}>
                      {change.icon} {change.label}
                    </div>
                    <div className="text-yellow-400 font-bold">{player.score}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}