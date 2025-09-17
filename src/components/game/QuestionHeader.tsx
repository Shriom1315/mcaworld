'use client'

import { Clock, Target, HelpCircle, CheckSquare } from 'lucide-react'

interface QuestionHeaderProps {
  questionNumber: number
  totalQuestions: number
  questionType?: 'multiple_choice' | 'true_false' | 'type_answer'
  timeLeft?: number
  className?: string
}

export default function QuestionHeader({
  questionNumber,
  totalQuestions,
  questionType = 'multiple_choice',
  timeLeft,
  className = ''
}: QuestionHeaderProps) {
  const getQuestionTypeDisplay = () => {
    switch (questionType) {
      case 'true_false':
        return {
          text: 'True or false',
          icon: <CheckSquare className="w-4 h-4" />,
          colors: 'from-red-500 to-blue-500'
        }
      case 'type_answer':
        return {
          text: 'Type answer',
          icon: <HelpCircle className="w-4 h-4" />,
          colors: 'from-purple-500 to-pink-500'
        }
      default:
        return {
          text: 'Quiz',
          icon: <div className="w-4 h-4 bg-white/90 rounded-sm"></div>,
          colors: 'from-red-500 to-blue-500'
        }
    }
  }

  const typeDisplay = getQuestionTypeDisplay()

  return (
    <div className={`absolute top-4 left-0 right-0 z-20 ${className}`}>
      <div className="flex items-center justify-between px-4">
        {/* Question number indicator (left) */}
        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 shadow-lg">
          <span className="text-white font-bold text-lg">{questionNumber}</span>
        </div>

        {/* Quiz type badge (center) */}
        <div className="bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-2 shadow-lg border border-white/50">
          <div className={`w-6 h-6 bg-gradient-to-br ${typeDisplay.colors} rounded-sm flex items-center justify-center`}>
            {typeDisplay.icon}
          </div>
          <span className="text-gray-800 font-semibold text-sm">{typeDisplay.text}</span>
        </div>

        {/* Timer (right) - only show if timeLeft is provided */}
        {timeLeft !== undefined && (
          <div 
            className={`
              w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg border-2
              ${timeLeft <= 5 
                ? 'bg-red-500 border-red-300 text-white animate-pulse' 
                : timeLeft <= 10 
                  ? 'bg-yellow-500 border-yellow-300 text-white' 
                  : 'bg-green-500 border-green-300 text-white'}
              transition-all duration-300 ease-out
            `}
          >
            {timeLeft}
          </div>
        )}
      </div>

      {/* Progress bar showing question progress */}
      <div className="mt-3 px-4">
        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
          <div 
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          >
            <div className="h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
          </div>
        </div>
        <div className="text-center mt-1">
          <span className="text-white/80 text-xs font-medium">
            {questionNumber} of {totalQuestions}
          </span>
        </div>
      </div>
    </div>
  )
}