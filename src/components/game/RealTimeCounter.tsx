'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { COLLECTIONS } from '@/types/firebase'

interface RealTimeCounterProps {
  gameId: string
  className?: string
}

export default function RealTimeCounter({ gameId, className = '' }: RealTimeCounterProps) {
  const [players, setPlayers] = useState<any[]>([])
  const [playersAnswered, setPlayersAnswered] = useState(0)
  const [totalPlayers, setTotalPlayers] = useState(0)

  useEffect(() => {
    if (!gameId) return

    const gameSessionsRef = collection(db, COLLECTIONS.GAME_SESSIONS)
    const q = query(gameSessionsRef, where('gameId', '==', gameId))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allPlayers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[]
      
      setPlayers(allPlayers)
      setTotalPlayers(allPlayers.length)
      setPlayersAnswered(allPlayers.filter(p => p.answered).length)
    }, (error) => {
      console.error('Error listening to real-time counter:', error)
    })

    return () => unsubscribe()
  }, [gameId])

  return (
    <div className={`grid grid-cols-2 gap-4 ${className}`}>
      <div className="bg-gray-700 rounded-lg p-3 text-center transform transition-all duration-300 hover:scale-105 relative overflow-hidden">
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg"></div>
        
        <div className="relative z-10">
          <div className="text-2xl font-bold text-green-400 animate-score-increase">
            {playersAnswered}
          </div>
          <div className="text-xs text-gray-300 font-semibold">Answered</div>
          
          {/* Enhanced progress bar */}
          {playersAnswered > 0 && (
            <div className="w-full bg-gray-600 rounded-full h-3 mt-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-700 ease-out relative animate-progress-fill"
                style={{ width: `${(playersAnswered / totalPlayers) * 100}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
              </div>
            </div>
          )}
          
          {/* Percentage display */}
          {totalPlayers > 0 && (
            <div className="text-xs text-green-300 mt-1 font-medium">
              {Math.round((playersAnswered / totalPlayers) * 100)}% complete
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-gray-700 rounded-lg p-3 text-center transform transition-all duration-300 hover:scale-105 relative overflow-hidden">
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-lg"></div>
        
        <div className="relative z-10">
          <div className="text-2xl font-bold text-orange-400">
            {totalPlayers - playersAnswered}
          </div>
          <div className="text-xs text-gray-300 font-semibold">Waiting</div>
          
          {/* Enhanced waiting animation */}
          {(totalPlayers - playersAnswered) > 0 && (
            <div className="flex justify-center mt-3">
              <div className="flex space-x-1">
                {[...Array(Math.min(4, totalPlayers - playersAnswered))].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-orange-400 rounded-full animate-waiting-dots"
                    style={{ animationDelay: `${i * 0.3}s` }}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Time pressure indicator */}
          {(totalPlayers - playersAnswered) > (totalPlayers * 0.7) && totalPlayers > 2 && (
            <div className="text-xs text-orange-300 mt-1 animate-pulse">
              ⏰ Hurry up!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}