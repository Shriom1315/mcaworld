// User Types
export interface User {
  id: string;
  email: string;
  username: string;
  role: 'teacher' | 'student' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

// Quiz Types
export interface Quiz {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  creatorId: string;
  questions: Question[];
  settings: QuizSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'type-answer';
  question: string;
  timeLimit: number; // in seconds
  points: number;
  answers: Answer[];
  correctAnswerIds: string[];
  media?: {
    type: 'image' | 'video';
    url: string;
  };
}

export interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizSettings {
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  showAnswers: boolean;
  showCorrectAnswers: boolean;
  allowAnswerChange: boolean;
}

// Game Types
export interface Game {
  id: string;
  pin: string;
  quizId: string;
  hostId: string;
  status: 'waiting' | 'active' | 'finished';
  currentQuestionIndex: number;
  players: Player[];
  startedAt?: Date;
  finishedAt?: Date;
}

export interface Player {
  id: string;
  nickname: string;
  score: number;
  answers: PlayerAnswer[];
  joinedAt: Date;
  isActive: boolean;
}

export interface PlayerAnswer {
  questionId: string;
  answerId: string[];
  timeToAnswer: number; // in milliseconds
  isCorrect: boolean;
  points: number;
}

// Socket Events
export interface SocketEvents {
  // Host events
  'game:start': (gamePin: string) => void;
  'game:next-question': (gamePin: string) => void;
  'game:end': (gamePin: string) => void;
  
  // Player events
  'player:join': (data: { gamePin: string; nickname: string }) => void;
  'player:answer': (data: { gamePin: string; playerId: string; answerId: string[]; timeToAnswer: number }) => void;
  
  // Broadcast events
  'game:player-joined': (player: Player) => void;
  'game:question-started': (question: Question, timeLimit: number) => void;
  'game:question-ended': (results: QuestionResults) => void;
  'game:finished': (finalResults: GameResults) => void;
}

export interface QuestionResults {
  questionId: string;
  correctAnswerIds: string[];
  playerAnswers: Array<{
    playerId: string;
    nickname: string;
    answerId: string[];
    isCorrect: boolean;
    points: number;
    timeToAnswer: number;
  }>;
  leaderboard: Array<{
    playerId: string;
    nickname: string;
    totalScore: number;
    rank: number;
  }>;
}

export interface GameResults {
  gameId: string;
  quiz: Quiz;
  totalPlayers: number;
  totalQuestions: number;
  leaderboard: Array<{
    playerId: string;
    nickname: string;
    totalScore: number;
    correctAnswers: number;
    rank: number;
  }>;
  questionResults: QuestionResults[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  role: 'teacher' | 'student';
}

export interface CreateQuizForm {
  title: string;
  description?: string;
  coverImage?: string;
}

export interface CreateQuestionForm {
  type: 'multiple-choice' | 'true-false' | 'type-answer';
  question: string;
  timeLimit: number;
  points: number;
  answers: Array<{
    text: string;
    isCorrect: boolean;
  }>;
  media?: {
    type: 'image' | 'video';
    url: string;
  };
}