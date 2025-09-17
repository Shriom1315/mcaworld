'use client'

import { useState, useEffect } from 'react'
import { Play, Clock, Target } from 'lucide-react'

interface CountdownReadyProps {
  questionNumber: number
  countdown: number
  onCountdownComplete?: () => void
  className?: string
}

export default function CountdownReady({
  questionNumber,
  countdown,
  onCountdownComplete,
  className = ''
}: CountdownReadyProps) {
  const [currentCount, setCurrentCount] = useState(countdown)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    setCurrentCount(countdown)
    setIsReady(false)

    const interval = setInterval(() => {
      setCurrentCount(prev => {
        if (prev <= 1) {
          setIsReady(true)
          clearInterval(interval)
          setTimeout(() => {
            onCountdownComplete?.()
          }, 500)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [countdown, onCountdownComplete])

  const getCountdownText = () => {
    if (isReady) return "Ready..."
    if (currentCount === 3) return "3"
    if (currentCount === 2) return "2"
    if (currentCount === 1) return "1"
    return currentCount.toString()
  }

  const getCountdownColor = () => {
    if (isReady) return "text-green-400"
    if (currentCount <= 1) return "text-red-400"
    if (currentCount <= 2) return "text-yellow-400"
    return "text-blue-400"
  }

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-4 ${className}`}>
      {/* Background overlay with classroom image effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/90 via-blue-600/90 to-indigo-700/90"></div>
      
      <div className="relative z-10 text-center text-white max-w-md w-full">
        {/* Question title */}
        <h1 className="text-5xl font-bold mb-12 text-white animate-fade-in">
          Question {questionNumber}
        </h1>

        {/* Countdown circle */}
        <div className="relative mb-12">
          <div 
            className={`
              w-40 h-40 rounded-full flex items-center justify-center mx-auto shadow-2xl
              bg-white/20 backdrop-blur-sm border-4 border-white/30
              ${!isReady ? 'animate-pulse' : 'animate-bounce'}
              transition-all duration-300 ease-out
            `}
          >
            {isReady ? (
              <Play className="w-16 h-16 text-green-400" />
            ) : (
              <span 
                className={`
                  text-6xl font-bold
                  ${getCountdownColor()}
                  transition-all duration-200 ease-out
                  ${currentCount <= 1 ? 'animate-pulse scale-110' : 'scale-100'}
                `}
              >
                {getCountdownText()}
              </span>
            )}
          </div>

          {/* Countdown ring animation */}
          {!isReady && (
            <div className="absolute inset-0 w-40 h-40 mx-auto">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  className="text-white/20"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (currentCount / countdown)}`}
                  className={`${getCountdownColor()} transition-all duration-1000 ease-linear`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Ready text */}
        <div 
          className={`
            text-2xl font-semibold mb-8
            ${isReady ? 'text-green-400 animate-pulse' : 'text-white/80'}
            transition-all duration-500 ease-out
          `}
        >
          {isReady ? "Ready..." : "Get ready!"}
        </div>

        {/* Instruction text */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-8">
          <p className="text-white/90 text-sm">
            {isReady 
              ? "Look at the screen for the question" 
              : "Question starting in..."}
          </p>
        </div>

        {/* Progress indicator dots */}
        <div className="flex justify-center space-x-2 mb-8">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`
                w-3 h-3 rounded-full transition-all duration-300
                ${i < (3 - currentCount) || isReady ? 'bg-green-400' : 'bg-white/30'}
                ${i === (3 - currentCount) && !isReady ? 'animate-pulse scale-125' : 'scale-100'}
              `}
            />
          ))}
        </div>
      </div>
    </div>
  )
}