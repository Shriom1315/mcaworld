'use client'

import { useState, useEffect } from 'react'
import { Clock, X, Heart, Star } from 'lucide-react'

interface TimesUpScreenProps {
  questionNumber: number
  playerName?: string
  totalScore: number
  rank: number
  encouragingMessage?: string
  onComplete?: () => void
  className?: string
}

export default function TimesUpScreen({
  questionNumber,
  playerName = 'Player',
  totalScore,
  rank,
  encouragingMessage = "We believe in you!",
  onComplete,
  className = ''
}: TimesUpScreenProps) {
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'show' | 'exit'>('enter')

  useEffect(() => {
    const timer1 = setTimeout(() => setAnimationPhase('show'), 300)
    const timer2 = setTimeout(() => {
      setAnimationPhase('exit')
      onComplete?.()
    }, 3000)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [onComplete])

  const getEncouragingMessages = () => {
    const messages = [
      "We believe in you!",
      "Don't give up!",
      "You've got this!",
      "Keep trying!",
      "Better luck next time!",
      "Stay focused!",
      "You're learning!",
      "Keep going!"
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  const getRankMessage = () => {
    if (rank === 1) return "You're still in the lead!"
    if (rank <= 3) return "You're still on the podium!"
    if (rank <= 5) return "You're doing great!"
    return "Keep pushing forward!"
  }

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-4 ${className}`}>
      {/* Background overlay with classroom image effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-600/90 via-pink-600/90 to-purple-700/90"></div>
      
      <div className="relative z-10 text-center text-white max-w-md w-full">
        {/* Question number indicator (top-left style) */}
        <div className="absolute -top-20 left-0">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {questionNumber}
          </div>
        </div>

        {/* Quiz type badge (top-center style) */}
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
          <div className="bg-white/90 rounded-full px-4 py-2 flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-blue-500 rounded-sm flex items-center justify-center">
              <div className="w-4 h-4 bg-white/90 rounded-sm"></div>
            </div>
            <span className="text-gray-800 font-semibold text-sm">Quiz</span>
          </div>
        </div>

        {/* Main "Time's up" circle */}
        <div 
          className={`
            w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl
            bg-red-500 border-4 border-red-300
            ${animationPhase === 'enter' ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}
            transition-all duration-500 ease-out
          `}
        >
          <X className="w-20 h-20 text-white" />
        </div>

        {/* Main title */}
        <h1 
          className={`
            text-5xl font-bold mb-6 text-white
            ${animationPhase === 'enter' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}
            transition-all duration-500 delay-200 ease-out
          `}
        >
          Time's up
        </h1>

        {/* Encouraging message box */}
        <div 
          className={`
            bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 mb-6
            ${animationPhase === 'show' ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4'}
            transition-all duration-500 delay-300 ease-out
          `}
        >
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Heart className="w-5 h-5 text-pink-400" />
            <span className="text-lg font-semibold">{encouragingMessage}</span>
            <Heart className="w-5 h-5 text-pink-400" />
          </div>
          <p className="text-gray-300 text-sm">
            {getRankMessage()}
          </p>
        </div>

        {/* Current status */}
        <div 
          className={`
            grid grid-cols-2 gap-4 mb-6
            ${animationPhase === 'show' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            transition-all duration-500 delay-500 ease-out
          `}
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-yellow-400">{totalScore}</div>
            <div className="text-xs text-gray-300">Current Score</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">#{rank}</div>
            <div className="text-xs text-gray-300">Your Rank</div>
          </div>
        </div>

        {/* "You're on the podium!" message (if applicable) */}
        {rank <= 3 && (
          <div 
            className={`
              text-lg font-semibold text-yellow-300 mb-6
              ${animationPhase === 'show' ? 'opacity-100' : 'opacity-0'}
              transition-all duration-500 delay-700 ease-out animate-pulse
            `}
          >
            You're on the podium!
          </div>
        )}

        {/* Motivational stars */}
        <div 
          className={`
            flex justify-center space-x-2 mb-8
            ${animationPhase === 'show' ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
            transition-all duration-500 delay-600 ease-out
          `}
        >
          {[...Array(3)].map((_, i) => (
            <Star
              key={i}
              className={`w-6 h-6 text-yellow-400 animate-pulse`}
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>

        {/* Next question indicator */}
        <div 
          className={`
            bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl p-4
            ${animationPhase === 'show' ? 'opacity-100' : 'opacity-0'}
            transition-all duration-500 delay-800 ease-out
          `}
        >
          <div className="flex items-center justify-center space-x-2 text-white/90 animate-pulse">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Next question coming up...</span>
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {/* Bottom player info area */}
        <div className="absolute bottom-8 left-0 right-0 flex items-center justify-between">
          {/* Player avatar and name */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">{playerName.charAt(0).toUpperCase()}</span>
            </div>
            <span className="text-white font-semibold">{playerName}</span>
          </div>

          {/* Status indicator */}
          <div className="bg-red-500/80 rounded-lg px-4 py-2">
            <span className="text-white font-bold text-sm">MISSED</span>
          </div>
        </div>
      </div>
    </div>
  )
}