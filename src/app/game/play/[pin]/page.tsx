'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useParams } from 'next/navigation'
import { Crown, Timer, Users, Trophy, Check, X, Zap, Monitor, Settings } from 'lucide-react'
import { collection, doc, getDoc, getDocs, query, where, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { COLLECTIONS } from '@/types/firebase'

export default function PlayerGamePage() {
  const searchParams = useSearchParams()
  const params = useParams()
  const gamePin = params.pin as string
  const nickname = searchParams.get('nickname') || 'Player'
  
  // Core game state (synchronized from host)
  const [quiz, setQuiz] = useState<any>(null)
  const [game, setGame] = useState<any>(null)
  const [playerSession, setPlayerSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // Player controller state (minimal)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [lastAnswerFeedback, setLastAnswerFeedback] = useState<'correct' | 'incorrect' | null>(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [rank, setRank] = useState(1)

  // Derived state from host-controlled game data
  const currentQuestion = quiz?.questions?.[game?.current_question_index]
  const gamePhase = game?.phase || 'waiting'
  const timeLeft = game?.time_left || 0
  const totalQuestions = quiz?.questions?.length || 0
  const currentQuestionIndex = game?.current_question_index || 0

  // Fetch initial game and quiz data
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        // Find game by PIN
        const gamesRef = collection(db, COLLECTIONS.GAMES)
        const gameQuery = query(gamesRef, where('pin', '==', gamePin))
        const gameSnapshot = await getDocs(gameQuery)
        
        if (gameSnapshot.empty) {
          console.error('Game not found with PIN:', gamePin)
          alert('Game not found. Please check the PIN.')
          return
        }
        
        const gameDoc = gameSnapshot.docs[0]
        const gameData = { id: gameDoc.id, ...gameDoc.data() } as any
        setGame(gameData)
        
        // Fetch quiz data
        const quizRef = doc(db, COLLECTIONS.QUIZZES, gameData.quiz_id)
        const quizDoc = await getDoc(quizRef)
        
        if (quizDoc.exists()) {
          const quizData = { id: quizDoc.id, ...quizDoc.data() }
          setQuiz(quizData)
        } else {
          console.error('Quiz not found with ID:', gameData.quiz_id)
          alert('Quiz not found')
        }
        
        // Find or create player session
        const gameSessionsRef = collection(db, COLLECTIONS.GAME_SESSIONS)
        const sessionQuery = query(gameSessionsRef, where('gameId', '==', gameData.id), where('nickname', '==', nickname))
        const sessionSnapshot = await getDocs(sessionQuery)
        
        if (!sessionSnapshot.empty) {
          const sessionDoc = sessionSnapshot.docs[0]
          const sessionData: any = { id: sessionDoc.id, ...sessionDoc.data() }
          setPlayerSession(sessionData)
          setScore(sessionData.score || 0)
          setStreak(sessionData.streak || 0)
          setRank(sessionData.rank || 1)
        }
        
      } catch (error) {
        console.error('Error fetching game data:', error)
        alert('Error loading game')
      } finally {
        setLoading(false)
      }
    }

    fetchGameData()
  }, [gamePin, nickname])

  // Real-time listener for game state changes (HOST CONTROLS EVERYTHING)
  useEffect(() => {
    if (!game?.id) return

    console.log('Setting up real-time game state listener for player:', game.id)
    
    const gameRef = doc(db, COLLECTIONS.GAMES, game.id)
    
    const unsubscribe = onSnapshot(gameRef, (snapshot) => {
      if (snapshot.exists()) {
        const gameData: any = { id: snapshot.id, ...snapshot.data() }
        
        // Reset player state when moving to new question
        if (gameData.current_question_index !== game?.current_question_index) {
          setAnswered(false)
          setSelectedAnswer(null)
          setLastAnswerFeedback(null)
        }
        
        setGame(gameData)
      }
    }, (error) => {
      console.error('Error listening to game state:', error)
    })

    return () => {
      console.log('Cleaning up game state listener for player')
      unsubscribe()
    }
  }, [game?.id, game?.current_question_index])

  // Listen for player session updates (score, streak, etc.)
  useEffect(() => {
    if (!playerSession?.id) return

    const sessionRef = doc(db, COLLECTIONS.GAME_SESSIONS, playerSession.id)
    
    const unsubscribe = onSnapshot(sessionRef, (snapshot) => {
      if (snapshot.exists()) {
        const sessionData: any = { id: snapshot.id, ...snapshot.data() }
        setPlayerSession(sessionData)
        setScore(sessionData.score || 0)
        setStreak(sessionData.streak || 0)
        setRank(sessionData.rank || 1)
        
        // Show feedback if last answer result is available
        if (sessionData.lastAnswerCorrect !== undefined) {
          setLastAnswerFeedback(sessionData.lastAnswerCorrect ? 'correct' : 'incorrect')
        }
      }
    })

    return () => unsubscribe()
  }, [playerSession?.id])

  // Submit answer function (CORE KAHOOT FUNCTIONALITY)
  const submitAnswer = async (answerIndex: number) => {
    if (!game?.id || !playerSession?.id || answered) return
    
    try {
      setSelectedAnswer(answerIndex)
      setAnswered(true)
      
      const sessionRef = doc(db, COLLECTIONS.GAME_SESSIONS, playerSession.id)
      
      // Calculate if answer is correct
      const currentQuestion = quiz?.questions?.[game.current_question_index]
      const isCorrect = currentQuestion?.answers?.[answerIndex]?.isCorrect || false
      
      // Calculate points based on time left and correctness
      const basePoints = currentQuestion?.points || 1000
      const timeBonus = Math.max(0, (game.time_left || 0) / (currentQuestion?.timeLimit || 30))
      const points = isCorrect ? Math.round(basePoints * (0.5 + 0.5 * timeBonus)) : 0
      
      // Update streak
      const newStreak = isCorrect ? (streak + 1) : 0
      const newScore = score + points
      
      // Update player session
      await updateDoc(sessionRef, {
        [`answers.${game.current_question_index}`]: {
          answerIndex,
          isCorrect,
          points,
          timeLeft: game.time_left || 0,
          submittedAt: serverTimestamp()
        },
        score: newScore,
        streak: newStreak,
        lastAnswerCorrect: isCorrect,
        answered: true,
        updated_at: serverTimestamp()
      })
      
      console.log(`Player ${nickname} submitted answer ${answerIndex}, correct: ${isCorrect}, points: ${points}`)
      
    } catch (error) {
      console.error('Error submitting answer:', error)
      // Reset state on error
      setAnswered(false)
      setSelectedAnswer(null)
    }
  }

  // Show loading screen while fetching data
  if (loading || !quiz || !game) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="retro-window w-full max-w-md">
          <div className="retro-window-header">
            <span>Loading Game...</span>
            <div className="retro-window-controls">
              <div className="retro-window-control minimize">_</div>
              <div className="retro-window-control maximize">□</div>
              <div className="retro-window-control close">×</div>
            </div>
          </div>
          <div className="p-6 text-center">
            <div className="mb-4">
              <Monitor className="w-12 h-12 mx-auto mb-2 text-gray-600" />
              <h2 className="font-pixel text-lg mb-4">CONNECTING...</h2>
            </div>
            <div className="retro-progress mb-4">
              <div className="retro-progress-bar" style={{width: '75%'}}></div>
            </div>
            <p className="font-mono text-sm text-gray-600">
              {'>'}  Initializing game session...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Waiting for host to start
  if (gamePhase === 'waiting' || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="retro-window w-full max-w-md">
          <div className="retro-window-header">
            <span>Game Status - PIN: {gamePin}</span>
            <div className="retro-window-controls">
              <div className="retro-window-control minimize">_</div>
              <div className="retro-window-control maximize">□</div>
              <div className="retro-window-control close">×</div>
            </div>
          </div>
          <div className="p-6 text-center">
            <div className="mb-4">
              <Timer className="w-12 h-12 mx-auto mb-2 text-blue-600" />
              <h2 className="font-pixel text-lg mb-4">WAITING...</h2>
            </div>
            <div className="bg-yellow-100 border-l-4 border-yellow-600 p-4 mb-4">
              <p className="font-mono text-sm text-gray-800">
                {'>'}  Waiting for host to start quiz...
              </p>
            </div>
            <div className="space-y-2 font-mono text-xs text-gray-600">
              <div>Player: {nickname}</div>
              <div>Status: Connected</div>
              <div>Questions: {totalQuestions}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Game finished - show final results
  if (gamePhase === 'finished') {
    const correctAnswers = playerSession?.answers ? Object.values(playerSession.answers).filter((answer: any) => answer.isCorrect).length : 0
    const totalAnswered = playerSession?.answers ? Object.keys(playerSession.answers).length : 0
    const accuracy = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="retro-window w-full max-w-2xl">
          <div className="retro-window-header">
            <span>Quiz Results - {nickname}</span>
            <div className="retro-window-controls">
              <div className="retro-window-control minimize">_</div>
              <div className="retro-window-control maximize">□</div>
              <div className="retro-window-control close">×</div>
            </div>
          </div>
          <div className="p-6">
            {/* Header with Trophy */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-yellow-400 border-2 border-gray-600 mx-auto mb-4 flex items-center justify-center">
                <Trophy className="w-12 h-12 text-yellow-800" />
              </div>
              <h1 className="font-pixel text-2xl mb-2">QUIZ COMPLETE!</h1>
              <p className="font-mono text-sm text-gray-600">Player: {nickname}</p>
            </div>
            
            {/* Performance Stats Window */}
            <div className="retro-window mb-6">
              <div className="retro-window-header">
                <span>Performance.exe</span>
                <div className="retro-window-controls">
                  <div className="retro-window-control minimize">_</div>
                </div>
              </div>
              <div className="p-4 bg-white">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-100 border border-blue-300">
                    <div className="text-3xl font-pixel text-blue-800 mb-1">{score}</div>
                    <div className="text-sm font-mono">TOTAL SCORE</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-100 border border-yellow-300">
                    <div className="text-3xl font-pixel text-yellow-800 mb-1">#{rank}</div>
                    <div className="text-sm font-mono">FINAL RANK</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-2 bg-green-100 border border-green-300">
                    <div className="text-xl font-pixel text-green-800">{correctAnswers}/{totalAnswered}</div>
                    <div className="text-xs font-mono">CORRECT</div>
                  </div>
                  <div className="text-center p-2 bg-purple-100 border border-purple-300">
                    <div className="text-xl font-pixel text-purple-800">{accuracy}%</div>
                    <div className="text-xs font-mono">ACCURACY</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center font-mono text-sm text-gray-600">
              {'>'}  Thank you for playing! Check the main screen for full results.
            </div>
          </div>
        </div>
      </div>
    )
  }

  // MAIN KAHOOT PLAYER CONTROLLER - Only colored buttons, never questions!
  return (
    <div className="min-h-screen">
      {/* Retro OS Desktop Taskbar */}
      <div className="bg-gray-300 border-b-2 border-gray-600 px-2 py-1 flex items-center justify-between text-sm font-mono">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-gray-200 border border-gray-400 px-2 py-1">
            <Settings className="w-4 h-4" />
            <span>QuizGame.exe</span>
          </div>
          <div className="text-xs text-gray-600">PIN: {gamePin}</div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs">
            <Crown className="w-3 h-3 text-yellow-600" />
            <span className="font-bold truncate max-w-[80px]">{nickname}</span>
          </div>
          <div className="flex items-center space-x-1 text-xs">
            <Trophy className="w-3 h-3 text-blue-600" />
            <span className="font-bold">{score}</span>
          </div>
          <div className="flex items-center space-x-1 text-xs">
            <span>Rank #{rank}</span>
          </div>
          <div className="bg-gray-200 border border-gray-400 px-2 py-1 text-xs">
            12:34 PM
          </div>
        </div>
      </div>

      {/* Main Game Content Area */}
      <div className="min-h-[calc(100vh-32px)] p-4">
        
        {/* Answer Feedback Phase */}
        {lastAnswerFeedback && (
          <div className="flex items-center justify-center min-h-full">
            <div className="retro-window w-full max-w-md">
              <div className="retro-window-header">
                <span>Answer Result</span>
                <div className="retro-window-controls">
                  <div className="retro-window-control minimize">_</div>
                </div>
              </div>
              <div className="p-6 text-center bg-white">
                <div className={`w-16 h-16 mx-auto mb-4 flex items-center justify-center border-2 ${
                  lastAnswerFeedback === 'correct' 
                    ? 'bg-green-400 border-green-600' 
                    : 'bg-red-400 border-red-600'
                }`}>
                  {lastAnswerFeedback === 'correct' ? (
                    <Check className="w-8 h-8 text-white" />
                  ) : (
                    <X className="w-8 h-8 text-white" />
                  )}
                </div>
                
                <h2 className={`font-pixel text-xl mb-4 ${
                  lastAnswerFeedback === 'correct' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {lastAnswerFeedback === 'correct' ? 'CORRECT!' : 'INCORRECT!'}
                </h2>
                
                <div className="bg-gray-100 border-2 border-gray-400 p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-pixel text-blue-600">{score}</div>
                      <div className="text-xs font-mono">TOTAL SCORE</div>
                    </div>
                    <div>
                      <div className="text-2xl font-pixel text-yellow-600">#{rank}</div>
                      <div className="text-xs font-mono">RANK</div>
                    </div>
                  </div>
                </div>
                
                {streak > 1 && (
                  <div className="retro-alert retro-alert-success mb-4">
                    <div className="flex items-center justify-center space-x-2 font-mono text-sm">
                      <Zap className="w-4 h-4" />
                      <span>STREAK: {streak} correct!</span>
                    </div>
                  </div>
                )}
                
                <div className="font-mono text-sm text-gray-600">
                  {'>'}  Waiting for next question...
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Player Controller - KAHOOT COLORED BUTTONS ONLY */}
        {!lastAnswerFeedback && (
          <div className="flex items-center justify-center min-h-full">
            <div className="retro-window w-full max-w-lg">
              <div className="retro-window-header">
                <span>Question {currentQuestionIndex + 1}/{totalQuestions} - Time: {timeLeft}s</span>
                <div className="retro-window-controls">
                  <div className="retro-window-control minimize">_</div>
                </div>
              </div>
              <div className="p-6 bg-white">
                {/* Timer Progress Bar */}
                <div className="retro-progress mb-6">
                  <div 
                    className="retro-progress-bar" 
                    style={{width: `${(timeLeft / (currentQuestion?.timeLimit || 30)) * 100}%`}}
                  ></div>
                </div>
                
                {/* Answer Streak Display */}
                {streak > 0 && (
                  <div className="retro-alert retro-alert-success mb-4">
                    <div className="flex items-center space-x-2 font-mono text-sm">
                      <Zap className="w-4 h-4" />
                      <span>STREAK: {streak} correct!</span>
                    </div>
                  </div>
                )}

                {/* Instructions */}
                <div className="text-center mb-6">
                  <h2 className="font-pixel text-lg mb-2">CHOOSE YOUR ANSWER</h2>
                  <p className="font-mono text-sm text-gray-600">
                    {'>'}  Look at the main screen for the question
                  </p>
                </div>

                {/* KAHOOT COLORED ANSWER BUTTONS - NEVER SHOW QUESTION TEXT */}
                <div className="grid grid-cols-2 gap-3">
                  {[0, 1, 2, 3].map((index) => {
                    const colors = [
                      'bg-red-400 hover:bg-red-300 border-red-600', 
                      'bg-blue-400 hover:bg-blue-300 border-blue-600', 
                      'bg-yellow-400 hover:bg-yellow-300 border-yellow-600', 
                      'bg-green-400 hover:bg-green-300 border-green-600'
                    ]
                    const symbols = ['▲', '◆', '●', '■']
                    
                    // Only show button if answer exists
                    const answerExists = currentQuestion?.answers?.[index]
                    if (!answerExists) return null
                    
                    return (
                      <button
                        key={index}
                        onClick={() => submitAnswer(index)}
                        disabled={answered}
                        className={`h-20 border-2 font-bold text-lg transition-all duration-200 transform ${
                          !answered ? 'hover:scale-105 active:scale-95' : 'opacity-50'
                        } ${
                          selectedAnswer === index ? 'ring-4 ring-white scale-105' : ''
                        } ${colors[index]}`}
                        style={{
                          boxShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                        }}
                      >
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-3xl mb-1 text-white drop-shadow-sm">{symbols[index]}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {answered && (
                  <div className="mt-4">
                    <div className="retro-alert mb-0">
                      <div className="font-mono text-sm">
                        <div className="flex items-center space-x-2">
                          <Check className="w-4 h-4 text-green-600" />
                          <span>Answer submitted successfully!</span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {'>'}  Waiting for other players...
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}