'use client'

import { useState, useEffect, useRef } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { COLLECTIONS } from '@/types/supabase'
import { Trophy, Crown, Star, Zap } from 'lucide-react'
import Avatar from '@/components/avatar/Avatar'

interface AnimatedLeaderboardProps {
  gameId: string
  showPositionChanges?: boolean
  maxPlayers?: number
  className?: string
}

interface PlayerWithPosition {
  id: string
  nickname: string
  score: number
  answered: boolean
  isCorrect?: boolean
  previousPosition?: number
  currentPosition: number
  positionChange?: 'up' | 'down' | 'same' | 'new'
  avatarId?: string
  answers?: any
}

export default function AnimatedLeaderboard({ 
  gameId, 
  showPositionChanges = true, 
  maxPlayers = 10,
  className = '' 
}: AnimatedLeaderboardProps) {
  const [players, setPlayers] = useState<PlayerWithPosition[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const previousPlayersRef = useRef<PlayerWithPosition[]>([])

  useEffect(() => {
    if (!gameId) return

    const gameSessionsRef = collection(db, COLLECTIONS.GAME_SESSIONS)
    const q = query(gameSessionsRef, where('gameId', '==', gameId))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allPlayers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[]

      // Sort players by score
      const sortedPlayers = allPlayers
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, maxPlayers)

      // Calculate position changes
      const playersWithPositions: PlayerWithPosition[] = sortedPlayers.map((player, index) => {
        const currentPosition = index + 1
        const previousPlayer = previousPlayersRef.current.find(p => p.id === player.id)
        const previousPosition = previousPlayer?.currentPosition
        
        let positionChange: 'up' | 'down' | 'same' | 'new' = 'new'
        if (previousPosition !== undefined) {
          if (currentPosition < previousPosition) positionChange = 'up'
          else if (currentPosition > previousPosition) positionChange = 'down'
          else positionChange = 'same'
        }

        return {
          ...player,
          currentPosition,
          previousPosition,
          positionChange,
          avatarId: player.avatarId || ['boy', 'girl', 'geek', 'woman', 'superhero', 'chinese'][index % 6]
        }
      })

      // Trigger animation if positions changed
      if (showPositionChanges && previousPlayersRef.current.length > 0) {
        const hasPositionChanges = playersWithPositions.some(
          player => player.positionChange === 'up' || player.positionChange === 'down'
        )
        if (hasPositionChanges) {
          setIsAnimating(true)
          setTimeout(() => setIsAnimating(false), 1500)
        }
      }

      setPlayers(playersWithPositions)
      previousPlayersRef.current = playersWithPositions
    }, (error) => {
      console.error('Error listening to animated leaderboard:', error)
    })

    return () => unsubscribe()
  }, [gameId, maxPlayers, showPositionChanges])

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="w-4 h-4 text-yellow-400" />
      case 2: return <Trophy className="w-4 h-4 text-gray-400" />
      case 3: return <Star className="w-4 h-4 text-amber-600" />
      default: return null
    }
  }

  const getPositionBadge = (position: number) => {
    switch (position) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900'
      case 2: return 'bg-gradient-to-r from-gray-300 to-gray-500 text-gray-900'
      case 3: return 'bg-gradient-to-r from-amber-500 to-amber-700 text-amber-900'
      default: return 'bg-gray-600 text-white'
    }
  }

  const getPositionChangeAnimation = (change: string) => {
    switch (change) {
      case 'up': return 'animate-rank-up'
      case 'down': return 'animate-rank-down'
      case 'new': return 'animate-new-entry'
      default: return ''
    }
  }

  const getPositionChangeIndicator = (change: string, position: number) => {
    switch (change) {
      case 'up':
        return (
          <div className="absolute -top-2 -right-2 z-10 animate-rank-up">
            <div className="bg-green-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold shadow-lg">
              <span className="animate-bounce">↗</span>
            </div>
          </div>
        )
      case 'down':
        return (
          <div className="absolute -top-2 -right-2 z-10 animate-rank-down">
            <div className="bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold shadow-lg">
              <span className="animate-pulse">↘</span>
            </div>
          </div>
        )
      case 'new':
        return (
          <div className="absolute -top-2 -right-2 z-10 animate-new-entry">
            <div className="bg-blue-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold shadow-lg">
              <span className="animate-ping">NEW</span>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {players.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-gray-500" />
          </div>
          <p className="font-medium">No players yet</p>
          <p className="text-xs opacity-75">Waiting for players to join...</p>
        </div>
      ) : (
        players.map((player, index) => {
          const accuracy = (player as any).answers && Object.keys((player as any).answers).length > 0 ? 
            Math.round((Object.values((player as any).answers).filter((a: any) => a.isCorrect).length / Object.keys((player as any).answers).length) * 100) : 0

          return (
            <div
              key={player.id}
              className={`
                relative flex items-center justify-between p-3 rounded-lg border transition-all duration-500 transform
                ${index < 3 ? 'bg-gradient-to-r from-yellow-900/30 to-amber-900/20 border-yellow-500/30' : 'bg-gray-700 border-gray-600'}
                ${isAnimating ? 'scale-105' : 'scale-100'}
                ${getPositionChangeAnimation(player.positionChange || '')}
                hover:scale-105 hover:shadow-lg
              `}
              style={{
                transitionDelay: `${index * 50}ms`
              }}
            >
              {/* Position Change Indicator */}
              {showPositionChanges && player.positionChange && player.positionChange !== 'same' && (
                getPositionChangeIndicator(player.positionChange, player.currentPosition)
              )}

              <div className="flex items-center space-x-3 flex-1">
                {/* Position Badge */}
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${getPositionBadge(player.currentPosition)}
                  shadow-lg transform transition-transform duration-300
                `}>
                  {player.currentPosition <= 3 ? getPositionIcon(player.currentPosition) : player.currentPosition}
                </div>

                {/* Avatar */}
                <div className="w-10 h-10">
                  <Avatar avatarId={player.avatarId} size="sm" className="w-full h-full" />
                </div>

                {/* Player Info */}
                <div className="flex-1">
                  <div className="font-bold text-sm text-white">{player.nickname}</div>
                  <div className="text-xs text-gray-300">
                    {accuracy}% accuracy
                  </div>
                </div>
              </div>
              
              {/* Score */}
              <div className="text-right">
                <div className="text-lg font-bold text-yellow-400 flex items-center">
                  <Zap className="w-4 h-4 mr-1" />
                  {player.score || 0}
                </div>
                <div className="text-xs text-gray-400">points</div>
              </div>
              
              {/* Status Indicator */}
              <div className="flex items-center space-x-1 ml-3">
                <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  player.answered ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
                }`} />
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}