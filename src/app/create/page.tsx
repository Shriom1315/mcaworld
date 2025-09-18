'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Save, Eye, Settings, Clock, Trophy, Image, Video, Trash2, ChevronUp, ChevronDown, Monitor, FileText, User } from 'lucide-react'
import { Question, Answer } from '@/types'
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { COLLECTIONS } from '@/types/firebase'

// Mock user data
const mockUser = {
  username: 'teacher_demo',
  email: 'teacher@example.com',
  role: 'teacher'
}

export default function CreateQuizPage() {
  const router = useRouter()
  const [quizTitle, setQuizTitle] = useState('Untitled Kahoot')
  const [quizDescription, setQuizDescription] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1)
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'multiple-choice',
      question: '',
      timeLimit: 30,
      points: 1000,
      answers: [
        { id: '1', text: '', isCorrect: true },
        { id: '2', text: '', isCorrect: false },
        { id: '3', text: '', isCorrect: false },
        { id: '4', text: '', isCorrect: false },
      ],
      correctAnswerIds: ['1']
    }
    setQuestions([...questions, newQuestion])
    setCurrentQuestionIndex(questions.length)
  }

  const updateQuestion = (index: number, updatedQuestion: Partial<Question>) => {
    const newQuestions = [...questions]
    newQuestions[index] = { ...newQuestions[index], ...updatedQuestion }
    setQuestions(newQuestions)
  }

  const updateAnswer = (questionIndex: number, answerIndex: number, text: string) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].answers[answerIndex].text = text
    setQuestions(newQuestions)
  }

  const setCorrectAnswer = (questionIndex: number, answerIndex: number) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].answers.forEach((answer, idx) => {
      answer.isCorrect = idx === answerIndex
    })
    newQuestions[questionIndex].correctAnswerIds = [newQuestions[questionIndex].answers[answerIndex].id]
    setQuestions(newQuestions)
  }

  const deleteQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index)
    setQuestions(newQuestions)
    if (currentQuestionIndex >= newQuestions.length) {
      setCurrentQuestionIndex(newQuestions.length - 1)
    }
  }

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === questions.length - 1)) {
      return
    }
    
    const newQuestions = [...questions]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    ;[newQuestions[index], newQuestions[targetIndex]] = [newQuestions[targetIndex], newQuestions[index]]
    setQuestions(newQuestions)
    setCurrentQuestionIndex(targetIndex)
  }

  const saveQuiz = async () => {
    if (!quizTitle.trim()) {
      alert('Please enter a quiz title')
      return
    }

    if (questions.length === 0) {
      alert('Please add at least one question')
      return
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i]
      if (!question.question.trim()) {
        alert(`Please enter text for question ${i + 1}`)
        return
      }

      const hasCorrectAnswer = question.answers.some(answer => answer.isCorrect && answer.text.trim())
      if (!hasCorrectAnswer) {
        alert(`Please set a correct answer for question ${i + 1}`)
        return
      }

      const emptyAnswers = question.answers.filter(answer => !answer.text.trim())
      if (emptyAnswers.length > 0) {
        alert(`Please fill in all answer options for question ${i + 1}`)
        return
      }
    }

    try {
      const now = Timestamp.now()
      const quizData = {
        title: quizTitle,
        description: quizDescription,
        creator_id: mockUser.email, // Using email as user ID for demo
        questions,
        settings: {
          shuffleQuestions: false,
          shuffleAnswers: false,
          showAnswers: true,
          showCorrectAnswers: true,
          allowAnswerChange: false
        },
        is_published: false,
        created_at: now,
        updated_at: now
      }

      // Save quiz to Firestore (client-side)
      const quizzesRef = collection(db, COLLECTIONS.QUIZZES)
      const docRef = await addDoc(quizzesRef, quizData)

      alert('Quiz saved successfully!')
      console.log('Quiz created with ID:', docRef.id)
      
      // Redirect to dashboard to see the newly created quiz
      router.push('/dashboard')
      
    } catch (error: any) {
      console.error('Error saving quiz:', error)
      
      let errorMessage = 'Failed to save quiz. Please try again.'
      if (error.code === 'permission-denied') {
        errorMessage = 'Please deploy Firebase security rules first. Check FIRESTORE_RULES_SETUP.md'
      }
      
      alert(errorMessage)
    }
  }

  const currentQuestion = currentQuestionIndex >= 0 ? questions[currentQuestionIndex] : null

  return (
    <div className="min-h-screen">
      {/* Retro OS Desktop Taskbar */}
      <div className="bg-gray-300 border-b-2 border-gray-600 px-2 py-1 flex items-center justify-between text-sm font-mono">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-gray-200 border border-gray-400 px-2 py-1">
            <FileText className="w-4 h-4" />
            <span>QuizCreator.exe</span>
          </div>
          <div className="text-xs text-gray-600">Creating: {quizTitle}</div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs">
            <User className="w-3 h-3" />
            <span>{mockUser.username}</span>
          </div>
          <div className="bg-gray-200 border border-gray-400 px-2 py-1 text-xs">
            12:34 PM
          </div>
        </div>
      </div>

      {/* Main Desktop Area */}
      <div className="h-[calc(100vh-32px)] flex">
        {/* Left Sidebar - Quiz Structure */}
        <div className="w-80 retro-window m-2">
          <div className="retro-window-header">
            <span>Quiz Structure</span>
            <div className="retro-window-controls">
              <div className="retro-window-control minimize">_</div>
              <div className="retro-window-control maximize">□</div>
            </div>
          </div>
          <div className="p-4 bg-white h-full overflow-y-auto">
            {/* Quiz Details */}
            <div className="mb-6 p-3 bg-gray-100 border border-gray-300">
              <label className="block font-mono text-xs mb-2 text-gray-700">QUIZ TITLE:</label>
              <input
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                className="w-full px-2 py-1 border border-gray-400 font-mono text-sm focus:outline-none focus:border-blue-500"
                placeholder="Enter quiz title..."
              />
              
              <label className="block font-mono text-xs mb-2 mt-3 text-gray-700">DESCRIPTION:</label>
              <textarea
                value={quizDescription}
                onChange={(e) => setQuizDescription(e.target.value)}
                className="w-full px-2 py-1 border border-gray-400 font-mono text-xs resize-none h-16 focus:outline-none focus:border-blue-500"
                placeholder="Add description..."
              />
            </div>

            {/* Add Question Button */}
            <button 
              onClick={addQuestion} 
              className="w-full mb-4 px-3 py-2 bg-green-400 hover:bg-green-300 border-2 border-gray-600 font-mono text-sm font-bold"
              style={{boxShadow: '2px 2px 4px rgba(0,0,0,0.3)'}}
            >
              [+] ADD QUESTION
            </button>

            {/* Questions List */}
            <div className="space-y-2">
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className={`p-3 border-2 cursor-pointer transition-all ${
                    currentQuestionIndex === index 
                      ? 'border-blue-500 bg-blue-100' 
                      : 'border-gray-400 bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => setCurrentQuestionIndex(index)}
                  style={{boxShadow: '1px 1px 2px rgba(0,0,0,0.2)'}}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-xs text-gray-600 mb-1">
                        QUESTION {index + 1}
                      </div>
                      <div className="font-mono text-sm truncate">
                        {question.question || 'Untitled Question'}
                      </div>
                      <div className="flex items-center space-x-2 mt-1 text-xs font-mono text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{question.timeLimit}s</span>
                        <Trophy className="w-3 h-3" />
                        <span>{question.points}pts</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-1 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          moveQuestion(index, 'up')
                        }}
                        disabled={index === 0}
                        className="w-6 h-6 bg-gray-300 border border-gray-500 flex items-center justify-center text-xs disabled:opacity-50"
                      >
                        ▲
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          moveQuestion(index, 'down')
                        }}
                        disabled={index === questions.length - 1}
                        className="w-6 h-6 bg-gray-300 border border-gray-500 flex items-center justify-center text-xs disabled:opacity-50"
                      >
                        ▼
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteQuestion(index)
                        }}
                        className="w-6 h-6 bg-red-400 border border-gray-500 flex items-center justify-center text-xs hover:bg-red-300"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Quiz Stats */}
            <div className="mt-6 p-3 bg-yellow-100 border border-yellow-400">
              <div className="font-mono text-xs mb-2 text-gray-700">QUIZ STATISTICS:</div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>Questions: {questions.length}</div>
                <div>Total Time: {questions.reduce((sum, q) => sum + q.timeLimit, 0)}s</div>
                <div>Total Points: {questions.reduce((sum, q) => sum + q.points, 0)}</div>
                <div>Avg. Time: {questions.length > 0 ? Math.round(questions.reduce((sum, q) => sum + q.timeLimit, 0) / questions.length) : 0}s</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Question Editor Window */}
        <div className="flex-1 retro-window m-2">
          <div className="retro-window-header">
            <span>{currentQuestion ? `Question ${currentQuestionIndex + 1} Editor` : 'Question Editor'}</span>
            <div className="retro-window-controls">
              <button 
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="retro-window-control minimize"
                title={isPreviewMode ? 'Edit Mode' : 'Preview Mode'}
              >
                {isPreviewMode ? 'E' : 'P'}
              </button>
              <button 
                onClick={saveQuiz}
                className="retro-window-control maximize"
                title="Save Quiz"
              >
                S
              </button>
            </div>
          </div>
          
          <div className="bg-white h-full overflow-y-auto">
            {!currentQuestion ? (
              <div className="flex items-center justify-center h-full">
                <div className="retro-window p-8 m-8">
                  <div className="retro-window-header">
                    <span>Getting Started</span>
                  </div>
                  <div className="p-6 text-center bg-white">
                    <div className="w-16 h-16 bg-yellow-200 border-2 border-gray-600 flex items-center justify-center mx-auto mb-4 font-mono text-2xl">
                      ?
                    </div>
                    <h2 className="font-mono text-lg font-bold text-gray-900 mb-2">CREATE YOUR FIRST QUESTION</h2>
                    <p className="font-mono text-sm text-gray-600 mb-6">Click the button below to add your first quiz question</p>
                    <button 
                      onClick={addQuestion}
                      className="px-6 py-2 bg-green-400 hover:bg-green-300 border-2 border-gray-600 font-mono font-bold"
                      style={{boxShadow: '2px 2px 4px rgba(0,0,0,0.3)'}}
                    >
                      [+] ADD QUESTION
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {/* Question Input Window */}
                <div className="retro-window">
                  <div className="retro-window-header">
                    <span>Question Text - Q{currentQuestionIndex + 1}</span>
                  </div>
                  <div className="p-4 bg-white">
                    <label className="block font-mono text-xs mb-2 text-gray-700">ENTER QUESTION:</label>
                    <textarea
                      value={currentQuestion.question}
                      onChange={(e) => updateQuestion(currentQuestionIndex, { question: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-gray-400 font-mono text-sm resize-none h-20 focus:outline-none focus:border-blue-500"
                      placeholder="Type your question here..."
                    />
                    
                    <div className="flex items-center space-x-2 mt-3">
                      <button className="px-3 py-1 bg-gray-300 hover:bg-gray-200 border border-gray-500 font-mono text-xs">
                        [IMG] Add Image
                      </button>
                      <button className="px-3 py-1 bg-gray-300 hover:bg-gray-200 border border-gray-500 font-mono text-xs">
                        [VID] Add Video
                      </button>
                    </div>
                  </div>
                </div>

                {/* Question Settings */}
                <div className="retro-window">
                  <div className="retro-window-header">
                    <span>Question Settings</span>
                  </div>
                  <div className="p-4 bg-white">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-mono text-xs mb-2 text-gray-700">TIME LIMIT:</label>
                        <select
                          value={currentQuestion.timeLimit}
                          onChange={(e) => updateQuestion(currentQuestionIndex, { timeLimit: parseInt(e.target.value) })}
                          className="w-full px-2 py-1 border-2 border-gray-400 font-mono text-sm focus:outline-none focus:border-blue-500"
                        >
                          <option value={10}>10 seconds</option>
                          <option value={20}>20 seconds</option>
                          <option value={30}>30 seconds</option>
                          <option value={60}>1 minute</option>
                          <option value={90}>90 seconds</option>
                          <option value={120}>2 minutes</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-mono text-xs mb-2 text-gray-700">POINTS:</label>
                        <select
                          value={currentQuestion.points}
                          onChange={(e) => updateQuestion(currentQuestionIndex, { points: parseInt(e.target.value) })}
                          className="w-full px-2 py-1 border-2 border-gray-400 font-mono text-sm focus:outline-none focus:border-blue-500"
                        >
                          <option value={500}>500 points</option>
                          <option value={1000}>1000 points</option>
                          <option value={1500}>1500 points</option>
                          <option value={2000}>2000 points</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Answer Options */}
                <div className="retro-window">
                  <div className="retro-window-header">
                    <span>Answer Options - Click to select correct answer</span>
                  </div>
                  <div className="p-4 bg-white">
                    <div className="grid grid-cols-2 gap-3">
                      {currentQuestion.answers.map((answer, answerIndex) => {
                        const colors = ['red', 'blue', 'yellow', 'green']
                        const symbols = ['▲', '♦', '●', '■']
                        const bgColors = {
                          red: 'bg-red-500',
                          blue: 'bg-blue-500', 
                          yellow: 'bg-yellow-500',
                          green: 'bg-green-500'
                        }
                        
                        return (
                          <div
                            key={answer.id}
                            className={`relative border-2 p-3 cursor-pointer transition-all ${
                              answer.isCorrect 
                                ? 'border-green-600 bg-green-100' 
                                : 'border-gray-400 bg-gray-50 hover:bg-gray-100'
                            }`}
                            onClick={() => setCorrectAnswer(currentQuestionIndex, answerIndex)}
                            style={{boxShadow: '1px 1px 2px rgba(0,0,0,0.2)'}}
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`w-8 h-8 ${bgColors[colors[answerIndex] as keyof typeof bgColors]} border border-gray-600 flex items-center justify-center text-white font-bold text-sm`}>
                                {symbols[answerIndex]}
                              </div>
                              <div className="flex-1">
                                <div className="font-mono text-xs text-gray-600 mb-1">
                                  OPTION {String.fromCharCode(65 + answerIndex)} {answer.isCorrect ? '(CORRECT)' : ''}
                                </div>
                                <textarea
                                  value={answer.text}
                                  onChange={(e) => {
                                    e.stopPropagation()
                                    updateAnswer(currentQuestionIndex, answerIndex, e.target.value)
                                  }}
                                  className="w-full bg-transparent border-none resize-none h-12 text-sm font-medium placeholder-gray-400 focus:outline-none"
                                  placeholder={`Answer ${answerIndex + 1}`}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                              
                              {answer.isCorrect && (
                                <div className="absolute top-2 right-2">
                                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs">✓</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    
                    <div className="mt-4 p-2 bg-gray-100 border border-gray-300">
                      <div className="font-mono text-xs text-gray-600">
                        INFO: Click on any answer option to mark it as the correct answer.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}