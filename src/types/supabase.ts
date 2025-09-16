// Firebase Document Types
export interface User {
  id: string
  email: string
  username: string
  role: 'teacher' | 'student' | 'admin'
  avatarUrl?: string
  createdAt: any // Firebase any // Firebase Timestamp
  updatedAt: any // Firebase any // Firebase Timestamp
}

export interface Quiz {
  id: string
  title: string
  description?: string
  coverImage?: string
  creatorId: string
  questions: Question[]
  settings: QuizSettings
  isPublished: boolean
  createdAt: any // Firebase Timestamp
  updatedAt: any // Firebase Timestamp
}

export interface Question {
  id: string
  type: 'multiple-choice' | 'true-false' | 'type-answer'
  question: string
  timeLimit: number
  points: number
  answers: Answer[]
  correctAnswerIds: string[]
  media?: {
    type: 'image' | 'video'
    url: string
  }
}

export interface Answer {
  id: string
  text: string
  isCorrect: boolean
}

export interface QuizSettings {
  shuffleQuestions: boolean
  shuffleAnswers: boolean
  showAnswers: boolean
  showCorrectAnswers: boolean
  allowAnswerChange: boolean
}

export interface Game {
  id: string
  pin: string
  quizId: string
  hostId: string
  status: 'waiting' | 'active' | 'finished'
  currentQuestionIndex: number
  players: Player[]
  startedAt?: any // Firebase any // Firebase Timestamp
  finishedAt?: any // Firebase any // Firebase Timestamp
  createdAt: any // Firebase any // Firebase Timestamp
  updatedAt: any // Firebase any // Firebase Timestamp
}

export interface Player {
  id: string
  nickname: string
  score: number
  answers: PlayerAnswer[]
  joinedAt: any // Firebase Timestamp
  isActive: boolean
}

export interface PlayerAnswer {
  questionId: string
  answerId: string[]
  timeToAnswer: number
  isCorrect: boolean
  points: number
}

export interface GameSession {
  id: string
  gameId: string
  playerId: string
  nickname: string
  score: number
  answers: PlayerAnswer[]
  joinedAt: any // Firebase Timestamp
  isActive: boolean
}

// Firestore Collection Names
export const COLLECTIONS = {
  USERS: 'users',
  QUIZZES: 'quizzes',
  GAMES: 'games',
  GAME_SESSIONS: 'gameSessions'
} as const

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Form Types
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  email: string
  username: string
  password: string
  confirmPassword: string
  role: 'teacher' | 'student'
}

export interface CreateQuizForm {
  title: string
  description?: string
  coverImage?: string
}

export interface CreateQuestionForm {
  type: 'multiple-choice' | 'true-false' | 'type-answer'
  question: string
  timeLimit: number
  points: number
  answers: Array<{
    text: string
    isCorrect: boolean
  }>
  media?: {
    type: 'image' | 'video'
    url: string
  }
}