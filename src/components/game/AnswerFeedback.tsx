'use client'

import { useState, useEffect } from 'react'
import { Check, X, Zap, Award, Target } from 'lucide-react'

interface AnswerFeedbackProps {
  isCorrect: boolean | null
  isTimeUp?: boolean
  questionScore: number
  totalScore: number
  streakCount: number
  onComplete?: () => void
  className?: string
}

export default function AnswerFeedback({
  isCorrect,
  isTimeUp = false,
  questionScore,
  totalScore,
  streakCount,
  onComplete,
  className = ''
}: AnswerFeedbackProps) {
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'show' | 'exit'>('enter')
  const [showScore, setShowScore] = useState(false)
  const [showStreak, setShowStreak] = useState(false)

  useEffect(() => {
    const timer1 = setTimeout(() => setAnimationPhase('show'), 300)
    const timer2 = setTimeout(() => setShowScore(true), 800)
    const timer3 = setTimeout(() => setShowStreak(true), 1200)
    const timer4 = setTimeout(() => {
      setAnimationPhase('exit')
      onComplete?.()
    }, 3000)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
    }
  }, [onComplete])

  const getMainIcon = () => {
    if (isTimeUp) return <X className="w-20 h-20 text-white" />
    if (isCorrect) return <Check className="w-20 h-20 text-white" />
    if (isCorrect === false) return <X className="w-20 h-20 text-white" />
    return <Target className="w-20 h-20 text-white" />
  }

  const getMainTitle = () => {
    if (isTimeUp) return "Time's up"
    if (isCorrect) return "Correct"
    if (isCorrect === false) return "Incorrect"
    return "Waiting..."
  }

  const getMainColor = () => {
    if (isTimeUp) return "bg-red-500"
    if (isCorrect) return "bg-green-500"
    if (isCorrect === false) return "bg-red-500"
    return "bg-gray-500"
  }

  const getEncouragingMessage = () => {
    if (isTimeUp) return "We believe in you!"
    if (isCorrect && streakCount > 0) return "You're on fire!"
    if (isCorrect) return "Great job!"
    if (isCorrect === false && streakCount > 0) return "Keep it up!"
    if (isCorrect === false) return "Better luck next time!"
    return "Hang tight..."
  }

  const getStreakMessage = () => {
    if (streakCount <= 1) return null
    if (streakCount >= 5) return "Amazing streak!"
    if (streakCount >= 3) return "Great streak!"
    return "Nice streak!"
  }

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-4 ${className}`}>
      {/* Background overlay with classroom image effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/90 via-blue-600/90 to-indigo-700/90"></div>
      
      <div className="relative z-10 text-center text-white max-w-md w-full">
        {/* Main result circle */}
        <div 
          className={`
            w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl
            ${getMainColor()}
            ${animationPhase === 'enter' ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}
            transition-all duration-500 ease-out
          `}
        >
          {getMainIcon()}
        </div>

        {/* Main title */}
        <h1 
          className={`
            text-5xl font-bold mb-6 text-white
            ${animationPhase === 'enter' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}
            transition-all duration-500 delay-200 ease-out
          `}
        >
          {getMainTitle()}
        </h1>

        {/* Answer streak indicator */}
        {streakCount > 1 && showStreak && (
          <div 
            className={`
              mb-6 animate-bounce
              ${showStreak ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}
              transition-all duration-500 ease-out
            `}
          >
            <div className="bg-orange-500 text-white px-6 py-3 rounded-full font-bold text-lg flex items-center justify-center space-x-2">
              <Award className="w-5 h-5" />
              <span>Answer Streak</span>
              <div className="w-8 h-8 bg-white text-orange-500 rounded-full flex items-center justify-center font-bold text-sm">
                {streakCount}
              </div>
            </div>
          </div>
        )}

        {/* Score display */}
        {questionScore > 0 && showScore && (
          <div 
            className={`
              bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 mb-6
              ${showScore ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4'}
              transition-all duration-500 ease-out
            `}
          >
            <div className="text-4xl font-bold text-yellow-400 animate-pulse">
              +{questionScore}
            </div>
            <p className="text-gray-300 text-sm mt-1">Points earned</p>
          </div>
        )}

        {/* Encouraging message */}
        <div 
          className={`
            bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 mb-6
            ${animationPhase === 'show' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            transition-all duration-500 delay-500 ease-out
          `}
        >
          <p className="text-lg font-semibold">{getEncouragingMessage()}</p>
          {getStreakMessage() && (
            <p className="text-sm text-yellow-300 mt-1">{getStreakMessage()}</p>
          )}
        </div>

        {/* "You're on the podium!" message (if high rank) */}
        <div 
          className={`
            text-lg font-semibold text-yellow-300
            ${animationPhase === 'show' ? 'opacity-100' : 'opacity-0'}
            transition-all duration-500 delay-700 ease-out animate-pulse
          `}
        >
          You're on the podium!
        </div>
      </div>
    </div>
  )
}