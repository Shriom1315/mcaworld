import { db } from '@/lib/firebase'
import { 
  doc, 
  onSnapshot, 
  updateDoc, 
  serverTimestamp,
  getDoc,
  Timestamp 
} from 'firebase/firestore'
import GameFlowStateMachine, { GameFlowState } from './gameFlowStateMachine'

export type GamePhase = 'waiting' | 'question' | 'results' | 'final'

export interface GameState {
  phase: GamePhase
  currentQuestionIndex: number
  questionStartTime: Timestamp | null
  questionDuration: number // in seconds
  timeRemaining: number
  isActive: boolean
  hostId: string
  totalQuestions: number
}

export interface PlayerAnswer {
  playerId: string
  playerName: string
  answerIndex: number
  responseTime: number
  isCorrect: boolean
}

export class GameStateManager {
  private gamePin: string
  private unsubscribe: (() => void) | null = null
  private timerInterval: NodeJS.Timeout | null = null
  private onStateChange: ((state: GameState) => void) | null = null
  private stateMachine: GameFlowStateMachine

  constructor(gamePin: string) {
    this.gamePin = gamePin
    this.stateMachine = new GameFlowStateMachine()
  }

  /**
   * Subscribe to real-time game state updates with state machine validation
   */
  subscribeToGameState(callback: (state: GameState) => void) {
    this.onStateChange = callback
    const gameRef = doc(db, 'games', this.gamePin)
    
    this.unsubscribe = onSnapshot(gameRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data()
        const gameState: GameState = {
          phase: data.phase || 'waiting',
          currentQuestionIndex: data.currentQuestionIndex || 0,
          questionStartTime: data.questionStartTime || null,
          questionDuration: data.questionDuration || 30,
          timeRemaining: data.timeRemaining || 30,
          isActive: data.isActive || false,
          hostId: data.hostId || '',
          totalQuestions: data.questions?.length || 0
        }
        
        // Calculate real-time remaining if question is active
        if (gameState.phase === 'question' && gameState.questionStartTime) {
          const now = new Date()
          const startTime = gameState.questionStartTime.toDate()
          const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000)
          gameState.timeRemaining = Math.max(0, gameState.questionDuration - elapsed)
        }
        
        // Process through state machine for validation
        try {
          const flowState = await this.stateMachine.processStateUpdate(gameState)
          console.log('🎮 GAME STATE: State machine processed update:', flowState.phase)
          
          // Update game state phase if state machine suggests a change
          if (flowState.phase !== gameState.phase) {
            gameState.phase = flowState.phase
          }
        } catch (error) {
          console.error('🚨 GAME STATE: State machine error:', error)
        }
        
        callback(gameState)
      }
    })
  }

  /**
   * Start a question (HOST ONLY)
   */
  async startQuestion(questionIndex: number, duration: number = 30) {
    try {
      const gameRef = doc(db, 'games', this.gamePin)
      await updateDoc(gameRef, {
        phase: 'question',
        currentQuestionIndex: questionIndex,
        questionStartTime: serverTimestamp(),
        questionDuration: duration,
        timeRemaining: duration,
        isActive: true
      })
      
      // Start server-side timer countdown
      this.startServerTimer(duration)
    } catch (error) {
      console.error('Error starting question:', error)
      throw error
    }
  }

  /**
   * End current question and show results (HOST ONLY)
   */
  async endQuestion() {
    try {
      const gameRef = doc(db, 'games', this.gamePin)
      await updateDoc(gameRef, {
        phase: 'results',
        questionStartTime: null,
        timeRemaining: 0,
        isActive: false
      })
      
      if (this.timerInterval) {
        clearInterval(this.timerInterval)
        this.timerInterval = null
      }
    } catch (error) {
      console.error('Error ending question:', error)
      throw error
    }
  }

  /**
   * Move to next question or end game (HOST ONLY)
   */
  async nextQuestion() {
    try {
      const gameRef = doc(db, 'games', this.gamePin)
      const gameDoc = await getDoc(gameRef)
      
      if (gameDoc.exists()) {
        const data = gameDoc.data()
        const currentIndex = data.currentQuestionIndex || 0
        const totalQuestions = data.questions?.length || 0
        
        if (currentIndex + 1 >= totalQuestions) {
          // End game
          await updateDoc(gameRef, {
            phase: 'final',
            isActive: false
          })
        } else {
          // Go to next question
          await updateDoc(gameRef, {
            phase: 'waiting',
            currentQuestionIndex: currentIndex + 1,
            timeRemaining: 0
          })
        }
      }
    } catch (error) {
      console.error('Error moving to next question:', error)
      throw error
    }
  }

  /**
   * Submit player answer
   */
  async submitAnswer(playerId: string, playerName: string, answerIndex: number) {
    try {
      const gameRef = doc(db, 'games', this.gamePin)
      const gameDoc = await getDoc(gameRef)
      
      if (gameDoc.exists()) {
        const data = gameDoc.data()
        const currentQuestionIndex = data.currentQuestionIndex || 0
        const questionStartTime = data.questionStartTime
        
        if (!questionStartTime || data.phase !== 'question') {
          throw new Error('No active question to answer')
        }
        
        // Calculate response time
        const now = new Date()
        const startTime = questionStartTime.toDate()
        const responseTime = Math.floor((now.getTime() - startTime.getTime()) / 1000)
        
        // Check if answer is correct
        const currentQuestion = data.questions[currentQuestionIndex]
        const isCorrect = answerIndex === currentQuestion.correctAnswer
        
        // Calculate points (faster answers get more points)
        const maxPoints = 1000
        const timeBonus = Math.max(0, (data.questionDuration - responseTime) / data.questionDuration)
        const points = isCorrect ? Math.floor(maxPoints * (0.5 + 0.5 * timeBonus)) : 0
        
        const answerData: PlayerAnswer = {
          playerId,
          playerName,
          answerIndex,
          responseTime,
          isCorrect
        }
        
        // Update player's answer and score
        const playerRef = doc(db, 'games', this.gamePin, 'players', playerId)
        await updateDoc(playerRef, {
          [`answers.${currentQuestionIndex}`]: answerData,
          score: data.players?.[playerId]?.score || 0 + points,
          lastAnswered: serverTimestamp()
        })
        
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
      throw error
    }
  }

  /**
   * Start server-side timer that updates Firestore
   */
  private startServerTimer(duration: number) {
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
    }
    
    let timeLeft = duration
    
    this.timerInterval = setInterval(async () => {
      timeLeft--
      
      try {
        const gameRef = doc(db, 'games', this.gamePin)
        await updateDoc(gameRef, {
          timeRemaining: timeLeft
        })
        
        // Auto-end question when time runs out
        if (timeLeft <= 0) {
          await this.endQuestion()
        }
      } catch (error) {
        console.error('Error updating timer:', error)
      }
    }, 1000)
  }

  /**
   * Get current game state (one-time fetch)
   */
  async getCurrentState(): Promise<GameState | null> {
    try {
      const gameRef = doc(db, 'games', this.gamePin)
      const gameDoc = await getDoc(gameRef)
      
      if (gameDoc.exists()) {
        const data = gameDoc.data()
        return {
          phase: data.phase || 'waiting',
          currentQuestionIndex: data.currentQuestionIndex || 0,
          questionStartTime: data.questionStartTime || null,
          questionDuration: data.questionDuration || 30,
          timeRemaining: data.timeRemaining || 30,
          isActive: data.isActive || false,
          hostId: data.hostId || '',
          totalQuestions: data.questions?.length || 0
        }
      }
      return null
    } catch (error) {
      console.error('Error getting current state:', error)
      return null
    }
  }

  /**
   * Cleanup subscriptions and state machine
   */
  cleanup() {
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = null
    }
    
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
      this.timerInterval = null
    }
    
    console.log('🎮 GAME STATE: Cleaned up GameStateManager and StateMachine')
  }
}

export default GameStateManager