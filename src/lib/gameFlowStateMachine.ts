import { GameState, GamePhase } from './gameStateManager'

export interface GameFlowState {
  phase: GamePhase
  canTransition: boolean
  nextPhase: GamePhase | null
  metadata: Record<string, any>
}

export interface GameFlowTransition {
  from: GamePhase
  to: GamePhase
  condition: (state: GameState) => boolean
  action?: (state: GameState) => Promise<void>
}

export class GameFlowStateMachine {
  private transitions: GameFlowTransition[] = []
  private currentState: GameFlowState
  
  constructor(initialPhase: GamePhase = 'waiting') {
    this.currentState = {
      phase: initialPhase,
      canTransition: true,
      nextPhase: null,
      metadata: {}
    }
    
    this.setupTransitions()
  }

  private setupTransitions() {
    // Define valid state transitions for Kahoot game flow
    this.transitions = [
      // From waiting to question (when host starts game)
      {
        from: 'waiting',
        to: 'question',
        condition: (state) => state.isActive && state.questionStartTime !== null,
        action: async (state) => {
          console.log('🎮 STATE MACHINE: Transitioning from waiting to question')
        }
      },
      
      // From question to results (when time runs out or host forces)
      {
        from: 'question',
        to: 'results',
        condition: (state) => !state.isActive || state.timeRemaining <= 0,
        action: async (state) => {
          console.log('🎮 STATE MACHINE: Transitioning from question to results')
        }
      },
      
      // From results to next question (when host advances)
      {
        from: 'results',
        to: 'question',
        condition: (state) => state.isActive && state.questionStartTime !== null,
        action: async (state) => {
          console.log(`🎮 STATE MACHINE: Moving to question ${state.currentQuestionIndex + 1}`)
        }
      },
      
      // From results to final (when no more questions)
      {
        from: 'results',
        to: 'final',
        condition: (state) => state.currentQuestionIndex >= state.totalQuestions - 1,
        action: async (state) => {
          console.log('🎮 STATE MACHINE: Game completed - showing final results')
        }
      },
      
      // From question directly to final (if host ends game early)
      {
        from: 'question',
        to: 'final',
        condition: (state) => !state.isActive && state.phase === 'final',
        action: async (state) => {
          console.log('🎮 STATE MACHINE: Game ended early by host')
        }
      }
    ]
  }

  /**
   * Process a game state update and determine if transitions should occur
   */
  async processStateUpdate(gameState: GameState): Promise<GameFlowState> {
    console.log(`🎮 STATE MACHINE: Processing state update - current: ${this.currentState.phase}, incoming: ${gameState.phase}`)
    
    // If the incoming state has changed phase directly, update immediately
    if (gameState.phase !== this.currentState.phase) {
      console.log(`🎮 STATE MACHINE: Direct phase change detected: ${this.currentState.phase} → ${gameState.phase}`)
      this.currentState.phase = gameState.phase
      this.currentState.metadata.lastUpdate = Date.now()
      return this.currentState
    }
    
    // Check for valid transitions based on conditions
    const validTransition = this.transitions.find(transition => 
      transition.from === this.currentState.phase && 
      transition.condition(gameState)
    )
    
    if (validTransition && this.currentState.canTransition) {
      console.log(`🎮 STATE MACHINE: Valid transition found: ${validTransition.from} → ${validTransition.to}`)
      
      // Temporarily disable transitions to prevent race conditions
      this.currentState.canTransition = false
      
      // Execute transition action if provided
      if (validTransition.action) {
        try {
          await validTransition.action(gameState)
        } catch (error) {
          console.error('🚨 STATE MACHINE: Error executing transition action:', error)
        }
      }
      
      // Update state
      this.currentState.phase = validTransition.to
      this.currentState.nextPhase = this.getNextPossiblePhase(validTransition.to, gameState)
      this.currentState.metadata = {
        ...this.currentState.metadata,
        lastTransition: {
          from: validTransition.from,
          to: validTransition.to,
          timestamp: Date.now()
        }
      }
      
      // Re-enable transitions after a brief delay
      setTimeout(() => {
        this.currentState.canTransition = true
      }, 500)
    }
    
    return this.currentState
  }

  /**
   * Get the next possible phase based on current phase and game state
   */
  private getNextPossiblePhase(currentPhase: GamePhase, gameState: GameState): GamePhase | null {
    const possibleTransitions = this.transitions.filter(t => t.from === currentPhase)
    
    for (const transition of possibleTransitions) {
      if (transition.condition(gameState)) {
        return transition.to
      }
    }
    
    return null
  }

  /**
   * Get current state machine state
   */
  getCurrentState(): GameFlowState {
    return { ...this.currentState }
  }

  /**
   * Force a phase transition (for emergency situations)
   */
  forceTransition(newPhase: GamePhase, reason: string = 'Manual override'): GameFlowState {
    console.log(`🎮 STATE MACHINE: Forced transition to ${newPhase} - Reason: ${reason}`)
    
    this.currentState.phase = newPhase
    this.currentState.metadata.forcedTransition = {
      reason,
      timestamp: Date.now()
    }
    
    return this.currentState
  }

  /**
   * Validate if a transition is allowed
   */
  canTransitionTo(targetPhase: GamePhase, gameState: GameState): boolean {
    return this.transitions.some(transition => 
      transition.from === this.currentState.phase &&
      transition.to === targetPhase &&
      transition.condition(gameState)
    )
  }

  /**
   * Get all valid transitions from current state
   */
  getValidTransitions(gameState: GameState): GamePhase[] {
    return this.transitions
      .filter(transition => 
        transition.from === this.currentState.phase &&
        transition.condition(gameState)
      )
      .map(transition => transition.to)
  }

  /**
   * Reset state machine to initial state
   */
  reset(initialPhase: GamePhase = 'waiting'): void {
    console.log(`🎮 STATE MACHINE: Resetting to ${initialPhase}`)
    
    this.currentState = {
      phase: initialPhase,
      canTransition: true,
      nextPhase: null,
      metadata: {
        resetAt: Date.now()
      }
    }
  }

  /**
   * Get state machine diagnostics
   */
  getDiagnostics(): Record<string, any> {
    return {
      currentPhase: this.currentState.phase,
      canTransition: this.currentState.canTransition,
      nextPhase: this.currentState.nextPhase,
      metadata: this.currentState.metadata,
      availableTransitions: this.transitions.map(t => `${t.from} → ${t.to}`),
      timestamp: Date.now()
    }
  }
}

export default GameFlowStateMachine