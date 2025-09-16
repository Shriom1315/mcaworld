'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Save, Eye, Settings, Clock, Trophy, Image, Video, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { Question, Answer } from '@/types'
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { COLLECTIONS } from '@/types/supabase'

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

  const answerColors = ['bg-kahoot-red', 'bg-kahoot-blue', 'bg-kahoot-yellow', 'bg-kahoot-green']
  const answerSymbols = ['▲', '♦', '●', '■']

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={mockUser} />
      
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar - Questions List */}
        <div className="w-80 bg-white border-r overflow-y-auto">
          <div className="p-6 border-b">
            <div className="space-y-4">
              <Input
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                className="font-bold text-lg"
                placeholder="Quiz title..."
              />
              <textarea
                value={quizDescription}
                onChange={(e) => setQuizDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none h-20 text-sm"
                placeholder="Add a description..."
              />
            </div>
          </div>

          <div className="p-4">
            <Button onClick={addQuestion} className="w-full mb-4">
              <Plus className="w-4 h-4 mr-2" />
              Add question
            </Button>

            <div className="space-y-2">
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    currentQuestionIndex === index 
                      ? 'border-kahoot-purple bg-kahoot-purple/5' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setCurrentQuestionIndex(index)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">
                      Question {index + 1}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          moveQuestion(index, 'up')
                        }}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          moveQuestion(index, 'down')
                        }}
                        disabled={index === questions.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteQuestion(index)
                        }}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {question.question || 'Enter your question...'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {questions.length} question{questions.length !== 1 ? 's' : ''}
              </span>
              {currentQuestion && (
                <span className="text-sm text-gray-600">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={() => setIsPreviewMode(!isPreviewMode)}>
                <Eye className="w-4 h-4 mr-2" />
                {isPreviewMode ? 'Edit' : 'Preview'}
              </Button>
              <Button onClick={saveQuiz}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>

          {/* Question Editor */}
          <div className="flex-1 p-6 overflow-y-auto">
            {!currentQuestion ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-12 h-12 text-gray-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Add your first question</h2>
                  <p className="text-gray-600 mb-6">Create engaging questions to test your students&apos; knowledge</p>
                  <Button onClick={addQuestion}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add question
                  </Button>
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-8">
                {/* Question Input */}
                <div className="bg-white rounded-xl p-8 shadow-sm">
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question
                    </label>
                    <textarea
                      value={currentQuestion.question}
                      onChange={(e) => updateQuestion(currentQuestionIndex, { question: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none h-24 text-lg font-medium"
                      placeholder="Enter your question here..."
                    />
                  </div>

                  <div className="flex items-center space-x-4 mb-6">
                    <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Image className="w-5 h-5 mr-2" />
                      Add image
                    </button>
                    <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Video className="w-5 h-5 mr-2" />
                      Add video
                    </button>
                  </div>

                  {/* Question Settings */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Time limit (seconds)
                      </label>
                      <select
                        value={currentQuestion.timeLimit}
                        onChange={(e) => updateQuestion(currentQuestionIndex, { timeLimit: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Trophy className="w-4 h-4 inline mr-1" />
                        Points
                      </label>
                      <select
                        value={currentQuestion.points}
                        onChange={(e) => updateQuestion(currentQuestionIndex, { points: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value={500}>500 points</option>
                        <option value={1000}>1000 points</option>
                        <option value={1500}>1500 points</option>
                        <option value={2000}>2000 points</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Answer Options */}
                <div className="bg-white rounded-xl p-8 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Answer options</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {currentQuestion.answers.map((answer, answerIndex) => (
                      <div
                        key={answer.id}
                        className={`relative border-2 rounded-xl p-4 transition-all cursor-pointer ${
                          answer.isCorrect 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setCorrectAnswer(currentQuestionIndex, answerIndex)}
                      >
                        <div className={`absolute top-3 left-3 w-8 h-8 ${answerColors[answerIndex]} rounded-lg flex items-center justify-center text-white font-bold`}>
                          {answerSymbols[answerIndex]}
                        </div>
                        
                        <div className="pl-12">
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
                    ))}
                  </div>

                  <p className="text-sm text-gray-500 mt-4">
                    Click on an answer to mark it as correct
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}