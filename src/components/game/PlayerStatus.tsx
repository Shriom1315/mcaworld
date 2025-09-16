'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { COLLECTIONS } from '@/types/supabase'
import { Clock, Users, Zap, Target, CheckCircle, AlertCircle } from 'lucide-react'
import Avatar from '@/components/avatar/Avatar'

interface PlayerStatusProps {
  gameId: string
  currentQuestionIndex?: number
  timeLeft?: number
  className?: string
}

interface PlayerData {
  id: string
  nickname: string
  answered: boolean
  isCorrect?: boolean
  timeToAnswer?: number
  score: number
  joinedAt: any
  avatarId?: string
}

export default function PlayerStatus({ 
  gameId, 
  currentQuestionIndex = 0,
  timeLeft = 30,
  className = '' 
}: PlayerStatusProps) {
  const [players, setPlayers] = useState<PlayerData[]>([])
  const [totalPlayers, setTotalPlayers] = useState(0)
  const [answeredPlayers, setAnsweredPlayers] = useState(0)
  const [newJoins, setNewJoins] = useState<string[]>([])

  useEffect(() => {
    if (!gameId) return

    const gameSessionsRef = collection(db, COLLECTIONS.GAME_SESSIONS)
    const q = query(gameSessionsRef, where('gameId', '==', gameId))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allPlayers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PlayerData[]

      // Check for new players
      const newPlayerIds = allPlayers
        .filter(p => !players.find(existing => existing.id === p.id))
        .map(p => p.id)
      
      if (newPlayerIds.length > 0) {
        setNewJoins(newPlayerIds)
        // Clear new joins after animation
        setTimeout(() => setNewJoins([]), 2000)
      }
      
      setPlayers(allPlayers)
      setTotalPlayers(allPlayers.length)
      setAnsweredPlayers(allPlayers.filter(p => p.answered).length)
    }, (error) => {
      console.error('Error listening to player status:', error)
    })

    return () => unsubscribe()
  }, [gameId, players])

  const getPlayerStatusIcon = (player: PlayerData) => {
    if (player.answered) {
      if (player.isCorrect) {
        return <CheckCircle className="w-4 h-4 text-green-400" />
      } else {
        return <AlertCircle className="w-4 h-4 text-red-400" />
      }
    }
    return <Clock className="w-4 h-4 text-orange-400 animate-pulse" />
  }

  const getPlayerStatusColor = (player: PlayerData) => {
    if (player.answered) {
      return player.isCorrect ? 'border-green-500 bg-green-500/20' : 'border-red-500 bg-red-500/20'
    }
    return 'border-orange-500 bg-orange-500/20'
  }

  const averageAnswerTime = players.filter(p => p.answered && p.timeToAnswer).length > 0
    ? Math.round(players.filter(p => p.answered && p.timeToAnswer).reduce((sum, p) => sum + (p.timeToAnswer || 0), 0) / players.filter(p => p.answered && p.timeToAnswer).length)
    : 0

  return (
    <div className={`bg-gray-800 rounded-xl p-6 ${className}`}>
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Users className="w-5 h-5 text-blue-400 mr-2" />
            <span className="text-2xl font-bold text-white">{totalPlayers}</span>
          </div>
          <div className="text-xs text-gray-400">Total Players</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
            <span className="text-2xl font-bold text-green-400">{answeredPlayers}</span>
          </div>
          <div className="text-xs text-gray-400">Answered</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Clock className="w-5 h-5 text-orange-400 mr-2" />
            <span className="text-2xl font-bold text-orange-400">{totalPlayers - answeredPlayers}</span>
          </div>
          <div className="text-xs text-gray-400">Waiting</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Zap className="w-5 h-5 text-yellow-400 mr-2" />
            <span className="text-2xl font-bold text-yellow-400">{averageAnswerTime}s</span>
          </div>
          <div className="text-xs text-gray-400">Avg Time</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-300">Progress</span>
          <span className="text-sm text-gray-300">{totalPlayers > 0 ? Math.round((answeredPlayers / totalPlayers) * 100) : 0}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-700 ease-out relative"
            style={{ width: `${totalPlayers > 0 ? (answeredPlayers / totalPlayers) * 100 : 0}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Player Grid */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        <div className="text-sm font-semibold text-gray-300 mb-3 flex items-center">
          <Target className="w-4 h-4 mr-2" />
          Live Player Status
        </div>
        
        {players.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No players joined yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {players
              .sort((a, b) => {
                // Sort by: answered first, then by answer time, then by join time
                if (a.answered && !b.answered) return -1
                if (!a.answered && b.answered) return 1
                if (a.answered && b.answered) {
                  return (a.timeToAnswer || 999) - (b.timeToAnswer || 999)
                }
                return a.joinedAt - b.joinedAt
              })
              .map((player, index) => (
                <div
                  key={player.id}
                  className={`
                    flex items-center justify-between p-3 rounded-lg border transition-all duration-500
                    ${getPlayerStatusColor(player)}
                    ${newJoins.includes(player.id) ? 'animate-new-entry' : ''}
                    hover:scale-105 transform
                  `}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8">
                      <Avatar 
                        avatarId={player.avatarId || ['boy', 'girl', 'geek', 'woman', 'superhero', 'chinese'][index % 6]} 
                        size="sm" 
                        className="w-full h-full"
                      />
                    </div>
                    
                    <div>
                      <div className="font-medium text-white text-sm">{player.nickname}</div>
                      <div className="text-xs text-gray-400">
                        {player.answered ? (
                          `Answered in ${player.timeToAnswer || 0}s`
                        ) : (
                          `Thinking... ${timeLeft}s left`
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="text-sm font-bold text-yellow-400">
                      {player.score || 0}
                    </div>
                    {getPlayerStatusIcon(player)}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
      
      {/* Quick Actions */}
      {totalPlayers > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="text-xs text-gray-400 text-center">
            {answeredPlayers === totalPlayers ? (
              <span className="text-green-400 font-semibold">🎉 All players answered!</span>
            ) : (
              <span>Waiting for {totalPlayers - answeredPlayers} more players...</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}