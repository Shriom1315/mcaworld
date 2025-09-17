'use client'

import { useState, useEffect } from 'react'
import { Flame, Zap, Star, Award } from 'lucide-react'

interface AnswerStreakProps {
  streakCount: number
  isActive?: boolean
  onStreakUpdate?: (count: number) => void
  className?: string
}

export default function AnswerStreak({
  streakCount,
  isActive = false,
  onStreakUpdate,
  className = ''
}: AnswerStreakProps) {
  const [displayCount, setDisplayCount] = useState(streakCount)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (streakCount !== displayCount) {
      setIsAnimating(true)
      
      const timer = setTimeout(() => {
        setDisplayCount(streakCount)
        setIsAnimating(false)
        onStreakUpdate?.(streakCount)
      }, 300)
      
      return () => clearTimeout(timer)
    }
  }, [streakCount, displayCount, onStreakUpdate])

  const getStreakIcon = () => {
    if (streakCount >= 10) return <Award className="w-4 h-4" />
    if (streakCount >= 5) return <Star className="w-4 h-4" />
    if (streakCount >= 3) return <Flame className="w-4 h-4" />
    return <Zap className="w-4 h-4" />
  }

  const getStreakColor = () => {
    if (streakCount >= 10) return 'from-purple-500 to-pink-500'
    if (streakCount >= 5) return 'from-yellow-500 to-orange-500'
    if (streakCount >= 3) return 'from-orange-500 to-red-500'
    return 'from-blue-500 to-indigo-500'
  }

  const getStreakText = () => {
    if (streakCount >= 10) return 'LEGENDARY!'
    if (streakCount >= 5) return 'ON FIRE!'
    if (streakCount >= 3) return 'HOT STREAK!'
    if (streakCount >= 1) return 'Answer Streak'
    return ''
  }

  if (streakCount <= 0) {
    return null
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div 
        className={`
          relative flex items-center space-x-2 bg-gradient-to-r ${getStreakColor()} 
          text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg
          ${isActive ? 'animate-pulse scale-110' : 'scale-100'}
          ${isAnimating ? 'animate-bounce' : ''}
          transition-all duration-300 ease-out
        `}
      >
        {/* Streak icon */}
        <div className="text-white">
          {getStreakIcon()}
        </div>
        
        {/* Streak text */}
        <span className="text-white font-semibold">
          {getStreakText()}
        </span>
        
        {/* Streak count circle */}
        <div 
          className={`
            w-8 h-8 bg-white rounded-full flex items-center justify-center
            ${isAnimating ? 'animate-spin' : ''}
            transition-all duration-300
          `}
        >
          <span 
            className={`
              font-bold text-sm bg-gradient-to-r ${getStreakColor()} bg-clip-text text-transparent
              ${isAnimating ? 'scale-125' : 'scale-100'}
              transition-all duration-300
            `}
          >
            {displayCount}
          </span>
        </div>

        {/* Glow effect for high streaks */}
        {streakCount >= 5 && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400/20 to-orange-400/20 animate-pulse"></div>
        )}

        {/* Particle effects for legendary streak */}
        {streakCount >= 10 && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-yellow-300 rounded-full animate-ping"
                style={{
                  top: `${20 + Math.random() * 60}%`,
                  left: `${20 + Math.random() * 60}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Streak milestone celebrations */}
      {isActive && streakCount > 0 && streakCount % 5 === 0 && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="flex items-center justify-center h-full">
            <div className="text-yellow-400 font-bold text-xs animate-bounce">
              🎉 {streakCount} STREAK! 🎉
            </div>
          </div>
        </div>
      )}
    </div>
  )
}