'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Crown, Timer, Users, Trophy, Check, X, Zap } from 'lucide-react'
import { collection, doc, getDoc, getDocs, query, where, onSnapshot, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { COLLECTIONS } from '@/types/firebase'
import Avatar from '@/components/avatar/Avatar'
import { 
  AnimatedLeaderboard, 
  AnswerFeedback, 
  CountdownReady, 
  TimesUpScreen, 
  QuestionHeader, 
  AnswerStreak 
} from '@/components/game'



export default function PlayerGamePage() {
  const searchParams = useSearchParams()
  const params = useParams()
  const gamePin = params.pin as string
  const nickname = searchParams.get('nickname') || 'Player'
  const gameId = searchParams.get('gameId') || ''
  
  // Real data state
  const [quiz, setQuiz] = useState<any>(null)
  const [game, setGame] = useState<any>(null)
  const [playerSession, setPlayerSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [gamePhase, setGamePhase] = useState<'countdown' | 'question' | 'answer' | 'results' | 'final' | 'timeup'>('countdown')
  const [score, setScore] = useState(0)
  const [questionScore, setQuestionScore] = useState(0)
  const [rank, setRank] = useState(1)
  const [totalPlayers, setTotalPlayers] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [answerStreak, setAnswerStreak] = useState(0)
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null)

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

  // Real-time listener for game state changes
  useEffect(() => {
    if (!game?.id) return

    console.log('Setting up real-time game state listener for player:', game.id)
    
    const gameRef = doc(db, COLLECTIONS.GAMES, game.id)
    
    const unsubscribe = onSnapshot(gameRef, (snapshot) => {
      if (snapshot.exists()) {
        const gameData: any = { id: snapshot.id, ...snapshot.data() }
        console.log('Real-time game state update for player:', gameData)
        
        // Update game state based on host changes
        if (gameData.current_question_index !== undefined) {
          setCurrentQuestionIndex(gameData.current_question_index)
        }
        if (gameData.game_phase) {
          setGamePhase(gameData.game_phase)
        }
        if (gameData.time_left !== undefined) {
          setTimeLeft(gameData.time_left)
        }
        
        // Reset answered state when moving to new question
        if (gameData.current_question_index !== currentQuestionIndex) {
          setAnswered(false)
          setSelectedAnswer(null)
          setQuestionScore(0)
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
  }, [game?.id, currentQuestionIndex])

  const currentQuestion = quiz?.questions?.[currentQuestionIndex]
  const totalQuestions = quiz?.questions?.length || 0
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1

  // Real-time listener for all game sessions to calculate rank
  useEffect(() => {
    if (!game?.id) return

    console.log('Setting up real-time leaderboard listener for player ranking')
    
    const gameSessionsRef = collection(db, COLLECTIONS.GAME_SESSIONS)
    const sessionsQuery = query(gameSessionsRef, where('gameId', '==', game.id))
    
    const unsubscribe = onSnapshot(sessionsQuery, (snapshot) => {
      const allPlayers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[]
      
      // Sort players by score and find current player's rank
      const sortedPlayers = allPlayers.sort((a, b) => (b.score || 0) - (a.score || 0))
      const currentPlayerRank = sortedPlayers.findIndex(p => p.nickname === nickname) + 1
      
      setRank(currentPlayerRank > 0 ? currentPlayerRank : 1)
      setTotalPlayers(allPlayers.length)
      
      console.log(`Player ${nickname} rank: ${currentPlayerRank}/${allPlayers.length}`)
    }, (error) => {
      console.error('Error listening to leaderboard:', error)
    })

    return () => {
      console.log('Cleaning up leaderboard listener for player')
      unsubscribe()
    }
  }, [game?.id, nickname])

  // Timer countdown
  useEffect(() => {
    if (gamePhase === 'question' && timeLeft > 0 && !answered) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && gamePhase === 'question' && !answered) {
      // Time's up - set streak to 0 and show time's up screen
      setAnswerStreak(0)
      setLastAnswerCorrect(false)
      setGamePhase('timeup')
    }
  }, [timeLeft, gamePhase, answered])

  // Auto-advance through phases
  useEffect(() => {
    if (gamePhase === 'countdown') {
      const timer = setTimeout(() => {
        setGamePhase('question')
      }, 3000)
      return () => clearTimeout(timer)
    } else if (gamePhase === 'answer' || gamePhase === 'timeup') {
      const timer = setTimeout(() => {
        if (isLastQuestion) {
          setGamePhase('final')
        } else {
          setGamePhase('results')
        }
      }, 3000)
      return () => clearTimeout(timer)
    } else if (gamePhase === 'results') {
      const timer = setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1)
        setTimeLeft(quiz?.questions?.[currentQuestionIndex + 1]?.timeLimit || 30)
        setSelectedAnswer(null)
        setAnswered(false)
        setQuestionScore(0)
        setLastAnswerCorrect(null)
        setGamePhase('countdown')
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [gamePhase, isLastQuestion, currentQuestionIndex, quiz?.questions])

  const handleAnswerSelect = async (answerId: string) => {
    if (answered || gamePhase !== 'question' || !currentQuestion || !playerSession) return
    
    setSelectedAnswer(answerId)
    setAnswered(true)
    
    try {
      // Calculate score based on time and correctness
      const isCorrect = currentQuestion.correctAnswerIds?.includes(answerId) || 
                       currentQuestion.answers?.find((a: any) => a.id === answerId)?.isCorrect
      
      // Update streak tracking
      setLastAnswerCorrect(isCorrect)
      if (isCorrect) {
        setAnswerStreak(prev => prev + 1)
      } else {
        setAnswerStreak(0)
      }
      
      const timeBonus = Math.floor((timeLeft / currentQuestion.timeLimit) * 500)
      const streakBonus = answerStreak >= 3 ? 100 * answerStreak : 0
      const questionPoints = isCorrect ? (currentQuestion.points || 1000) + timeBonus + streakBonus : 0
      
      setQuestionScore(questionPoints)
      const newTotalScore = score + questionPoints
      setScore(newTotalScore)
      
      // Save answer to Firebase
      const sessionRef = doc(db, COLLECTIONS.GAME_SESSIONS, playerSession.id)
      const answerData = {
        questionId: currentQuestion.id,
        answerId: answerId,
        timeToAnswer: currentQuestion.timeLimit - timeLeft,
        isCorrect: isCorrect,
        points: questionPoints,
        streak: isCorrect ? answerStreak + 1 : 0,
        timestamp: serverTimestamp()
      }
      
      // Update player session with new answer and score
      await updateDoc(sessionRef, {
        score: newTotalScore,
        streak: isCorrect ? answerStreak + 1 : 0,
        [`answers.${currentQuestionIndex}`]: answerData,
        answered: true,
        isCorrect: isCorrect
      })
      
      console.log('Answer submitted:', answerData)
      setGamePhase('answer')
      
    } catch (error) {
      console.error('Error submitting answer:', error)
      alert('Failed to submit answer. Please try again.')
      setAnswered(false)
      setSelectedAnswer(null)
    }
  }

  const answerColors = ['answer-red', 'answer-blue', 'answer-yellow', 'answer-green']
  const answerSymbols = ['▲', '♦', '●', '■']

  // Show loading screen while fetching data
  if (loading || !quiz || !game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-kahoot-purple via-kahoot-blue to-indigo-600 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">Loading game...</p>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-kahoot-purple via-kahoot-blue to-indigo-600 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Waiting for questions...</h1>
          <p className="text-gray-300 mb-6">The host will start the quiz soon.</p>
        </div>
      </div>
    )
  }

  if (gamePhase === 'final') {
    const correctAnswers = playerSession?.answers ? Object.values(playerSession.answers).filter((answer: any) => answer.isCorrect).length : 0
    const totalAnswered = playerSession?.answers ? Object.keys(playerSession.answers).length : 0
    const accuracy = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
        <div className="text-center text-white max-w-lg">
          <div className="w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <Trophy className="w-16 h-16 text-yellow-800" />
          </div>
          
          <h1 className="text-4xl font-bold mb-4">Great job, {nickname}!</h1>
          <p className="text-xl mb-8">You finished the quiz</p>
          
          {/* Individual Performance Card */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">Your Performance</h2>
            
            {/* Score and Rank */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2 text-yellow-400">{score}</div>
                <div className="text-sm opacity-90">Total Score</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2 text-blue-400">#{rank}</div>
                <div className="text-sm opacity-90">Final Rank</div>
              </div>
            </div>
            
            {/* Detailed Stats */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/30">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{correctAnswers}/{totalAnswered}</div>
                <div className="text-xs opacity-90">Correct Answers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{accuracy}%</div>
                <div className="text-xs opacity-90">Accuracy</div>
              </div>
            </div>
          </div>
          
          {/* Question-by-Question Breakdown */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-bold mb-4">Question Breakdown</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {quiz?.questions?.map((question: any, index: number) => {
                const playerAnswer = playerSession?.answers?.[index]
                const isCorrect = playerAnswer?.isCorrect
                const points = playerAnswer?.points || 0
                
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        isCorrect ? 'bg-green-500' : playerAnswer ? 'bg-red-500' : 'bg-gray-500'
                      }`}>
                        {isCorrect ? '✓' : playerAnswer ? '✗' : '-'}
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium">Question {index + 1}</div>
                        <div className="text-xs opacity-70">
                          {playerAnswer ? `${(playerAnswer.timeToAnswer || 0).toFixed(1)}s` : 'No answer'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-yellow-400 font-bold">{points > 0 ? `+${points}` : '0'}</div>
                      <div className="text-xs opacity-70">points</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* Achievement Badges */}
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-4">Achievements</h3>
            <div className="flex justify-center space-x-2 flex-wrap">
              {accuracy === 100 && totalAnswered > 0 && (
                <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-full px-3 py-1 text-xs font-bold mb-2">
                  🎯 Perfect Score!
                </div>
              )}
              {rank === 1 && (
                <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-full px-3 py-1 text-xs font-bold mb-2">
                  👑 Champion!
                </div>
              )}
              {rank <= 3 && rank > 1 && (
                <div className="bg-gray-400/20 border border-gray-400/50 rounded-full px-3 py-1 text-xs font-bold mb-2">
                  🏆 Top 3!
                </div>
              )}
              {correctAnswers >= totalQuestions * 0.8 && (
                <div className="bg-green-500/20 border border-green-500/50 rounded-full px-3 py-1 text-xs font-bold mb-2">
                  📚 Knowledge Master
                </div>
              )}
              {Object.values(playerSession?.answers || {}).some((answer: any) => answer.timeToAnswer < 5) && (
                <div className="bg-blue-500/20 border border-blue-500/50 rounded-full px-3 py-1 text-xs font-bold mb-2">
                  ⚡ Speed Demon
                </div>
              )}
            </div>
          </div>
          
          <p className="text-sm opacity-80">
            Thanks for playing! Your teacher will share the full results.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kahoot-purple via-kahoot-blue to-indigo-600">
      {/* Status Bar */}
      <div className="flex items-center justify-between p-4 bg-black/20 text-white">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Crown className="w-5 h-5 text-yellow-400" />
            <span className="font-bold">{nickname}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Trophy className="w-4 h-4" />
            <span className="font-semibold">{score}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm">#{rank}</span>
            <Users className="w-4 h-4" />
          </div>
          <span className="text-sm">PIN: {gamePin}</span>
        </div>
      </div>

      {/* Question Header */}
      <QuestionHeader 
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={totalQuestions}
        questionType={currentQuestion?.type || 'multiple_choice'}
        timeLeft={gamePhase === 'question' ? timeLeft : undefined}
      />

      {gamePhase === 'countdown' && (
        <CountdownReady
          questionNumber={currentQuestionIndex + 1}
          countdown={3}
          onCountdownComplete={() => setGamePhase('question')}
        />
      )}

      {gamePhase === 'question' && (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] p-4">
          {/* Answer Streak Display */}
          {answerStreak > 0 && (
            <div className="mb-4">
              <AnswerStreak streakCount={answerStreak} isActive={false} />
            </div>
          )}

          {/* Question Number */}
          <div className="text-center mb-6">
            <h2 className="text-white text-xl font-semibold">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </h2>
            <p className="text-white/80 text-sm mt-1">Look at the screen for the question</p>
          </div>

          {/* Answer Buttons */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
            {currentQuestion?.answers?.map((answer: any, index: number) => (
              <button
                key={answer.id}
                onClick={() => handleAnswerSelect(answer.id)}
                disabled={answered}
                className={`${answerColors[index]} h-24 rounded-xl font-bold text-xl shadow-lg transform transition-all duration-200 ${
                  !answered ? 'hover:scale-105 active:scale-95' : 'opacity-50'
                } ${selectedAnswer === answer.id ? 'ring-4 ring-white scale-105' : ''}`}
              >
                <div className="flex flex-col items-center justify-center">
                  <span className="text-3xl mb-1">{answerSymbols[index]}</span>
                  <span className="text-sm">{answer.text}</span>
                </div>
              </button>
            ))}
          </div>

          {answered && (
            <div className="mt-6 text-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-white">
                <p className="font-semibold">Answer submitted!</p>
                <p className="text-sm opacity-90">Waiting for others to answer...</p>
              </div>
            </div>
          )}
        </div>
      )}

      {gamePhase === 'answer' && (
        <AnswerFeedback
          isCorrect={lastAnswerCorrect}
          questionScore={questionScore}
          totalScore={score}
          streakCount={answerStreak}
          onComplete={() => {}}
        />
      )}

      {gamePhase === 'timeup' && (
        <TimesUpScreen
          questionNumber={currentQuestionIndex + 1}
          playerName={nickname}
          totalScore={score}
          rank={rank}
          onComplete={() => {}}
        />
      )}

      {gamePhase === 'results' && (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-72px)] p-4">
          <div className="text-center text-white max-w-2xl w-full">
            {/* Personal Result */}
            <div className="mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-kahoot-purple to-kahoot-blue rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                {rank === 1 ? (
                  <Crown className="w-12 h-12 text-yellow-400" />
                ) : rank <= 3 ? (
                  <Trophy className="w-12 h-12 text-yellow-400" />
                ) : (
                  <Users className="w-12 h-12" />
                )}
              </div>
              
              <h1 className="text-4xl font-bold mb-4 animate-pulse">
                {rank === 1 ? '👑 You\'re #1!' : 
                 rank <= 3 ? `🏆 Top ${rank}!` : 
                 `#${rank} Position`}
              </h1>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400 animate-score-update">{score}</div>
                    <div className="text-sm opacity-90">Total Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">#{rank}</div>
                    <div className="text-sm opacity-90">Your Rank</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">{totalPlayers}</div>
                    <div className="text-sm opacity-90">Total Players</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Live Leaderboard */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center justify-center">
                <Trophy className="w-6 h-6 mr-2 text-yellow-400" />
                Live Leaderboard
                <Trophy className="w-6 h-6 ml-2 text-yellow-400" />
              </h2>
              
              <AnimatedLeaderboard 
                gameId={game?.id || ''} 
                showPositionChanges={true} 
                maxPlayers={5}
                className="max-h-80 overflow-y-auto"
              />
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl">
              <div className="flex items-center justify-center space-x-2 text-yellow-400 animate-pulse">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">Next question coming up...</span>
                <Zap className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}