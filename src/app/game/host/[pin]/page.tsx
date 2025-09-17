'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Play, Pause, SkipForward, Users, Trophy, Timer, BarChart3, Settings, Home } from 'lucide-react'
import { collection, doc, getDoc, getDocs, query, where, onSnapshot, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { COLLECTIONS } from '@/types/firebase'
import Avatar from '@/components/avatar/Avatar'
import RealTimeCounter from '@/components/game/RealTimeCounter'
import AnimatedLeaderboard from '@/components/game/AnimatedLeaderboard'
import { LeaderboardReveal } from '@/components/game'
import PlayerStatus from '@/components/game/PlayerStatus'
import BitWiseLoader from '@/components/ui/BitWiseLoader'



// Mock data - only for fallback when no real quiz data
const mockQuiz = {
  title: 'Loading Quiz...',
  questions: [
    {
      id: '1',
      question: 'Loading question...',
      answers: [
        { id: '1', text: 'Loading...', isCorrect: true },
        { id: '2', text: 'Loading...', isCorrect: false },
        { id: '3', text: 'Loading...', isCorrect: false },
        { id: '4', text: 'Loading...', isCorrect: false }
      ],
      timeLimit: 30,
      points: 1000
    }
  ]
}

// Remove mock players - we only use real players now
// const mockPlayers = [...]

export default function HostGamePage() {
  const params = useParams()
  const gamePin = params.pin as string
  
  // Real data state
  const [quiz, setQuiz] = useState<any>(null)
  const [game, setGame] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [realPlayers, setRealPlayers] = useState<any[]>([])
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [gamePhase, setGamePhase] = useState<'waiting' | 'question' | 'results' | 'final'>('waiting')
  const [isPlaying, setIsPlaying] = useState(false)
  // Remove mock players - only use real players
  // const [players, setPlayers] = useState(mockPlayers)

  // Fetch game and quiz data
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        // Find game by PIN
        const gamesRef = collection(db, COLLECTIONS.GAMES)
        const gameQuery = query(gamesRef, where('pin', '==', gamePin))
        const gameSnapshot = await getDocs(gameQuery)
        
        if (gameSnapshot.empty) {
          console.error('Game not found with PIN:', gamePin)
          alert('Game not found')
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
      } catch (error) {
        console.error('Error fetching game data:', error)
        alert('Error loading game')
      } finally {
        setLoading(false)
      }
    }

    fetchGameData()
  }, [gamePin])

  // Real-time listener for game sessions (players)
  useEffect(() => {
    if (!game?.id) return

    console.log('Setting up real-time listener for game:', game.id)
    
    const gameSessionsRef = collection(db, COLLECTIONS.GAME_SESSIONS)
    const q = query(gameSessionsRef, where('gameId', '==', game.id))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const players = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      console.log('Real-time players update:', players)
      console.log('No mock data - all players are real Firebase data')
      setRealPlayers(players)
    }, (error) => {
      console.error('Error listening to players:', error)
    })

    return () => {
      console.log('Cleaning up real-time listener')
      unsubscribe()
    }
  }, [game?.id])

  // Real-time listener for game state changes
  useEffect(() => {
    if (!game?.id) return

    console.log('Setting up real-time game state listener for game:', game.id)
    
    const gameRef = doc(db, COLLECTIONS.GAMES, game.id)
    
    const unsubscribe = onSnapshot(gameRef, (snapshot) => {
      if (snapshot.exists()) {
        const gameData: any = { id: snapshot.id, ...snapshot.data() }
        console.log('Real-time game state update:', gameData)
        
        // Update local game state based on Firebase changes
        if (gameData.game_phase && gameData.game_phase !== gamePhase) {
          setGamePhase(gameData.game_phase)
        }
        if (gameData.current_question_index !== undefined && gameData.current_question_index !== currentQuestionIndex) {
          setCurrentQuestionIndex(gameData.current_question_index)
        }
        if (gameData.time_left !== undefined && gameData.time_left !== timeLeft) {
          setTimeLeft(gameData.time_left)
        }
        if (gameData.status === 'active' && !isPlaying && gamePhase === 'question') {
          setIsPlaying(true)
        }
        
        setGame(gameData)
      }
    }, (error) => {
      console.error('Error listening to game state:', error)
    })

    return () => {
      console.log('Cleaning up game state listener')
      unsubscribe()
    }
  }, [game?.id, gamePhase, currentQuestionIndex, timeLeft, isPlaying])

  const currentQuestion = quiz?.questions?.[currentQuestionIndex] || mockQuiz.questions[currentQuestionIndex]
  const totalQuestions = quiz?.questions?.length || mockQuiz.questions.length
  // Only use real players - no fallback to mock data
  const displayPlayers = realPlayers
  const playersAnswered = displayPlayers.filter((p: any) => p.answered).length
  const correctAnswers = displayPlayers.filter((p: any) => p.isCorrect).length

  // Timer countdown
  useEffect(() => {
    if (gamePhase === 'question' && isPlaying && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && gamePhase === 'question') {
      setGamePhase('results')
      setIsPlaying(false)
    }
  }, [timeLeft, gamePhase, isPlaying])

  // Show loading screen while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <BitWiseLoader size="xl" className="mb-8" text="Loading game..." />
        </div>
      </div>
    )
  }

  if (!quiz || !game) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Game Not Found</h1>
          <p className="text-gray-300 mb-6">The game with PIN {gamePin} could not be found.</p>
          <button onClick={() => window.location.href = '/dashboard'} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const startGame = async () => {
    if (!game?.id) return
    
    try {
      // Update game status to 'active' and set current question
      const gameRef = doc(db, COLLECTIONS.GAMES, game.id)
      await updateDoc(gameRef, {
        status: 'active',
        current_question_index: 0,
        started_at: serverTimestamp(),
        game_phase: 'question',
        time_left: currentQuestion?.timeLimit || 30
      })
      
      setGamePhase('question')
      setIsPlaying(true)
      setTimeLeft(currentQuestion?.timeLimit || 30)
      setCurrentQuestionIndex(0)
      
      console.log('Game started - all players will see this question')
    } catch (error) {
      console.error('Error starting game:', error)
      alert('Failed to start game. Please try again.')
    }
  }

  const pauseGame = () => {
    setIsPlaying(!isPlaying)
  }

  const nextQuestion = async () => {
    if (!game?.id) return
    
    try {
      if (currentQuestionIndex < totalQuestions - 1) {
        const nextIndex = currentQuestionIndex + 1
        const nextQ = quiz?.questions?.[nextIndex] || mockQuiz.questions[nextIndex]
        
        // Update game state in Firebase
        const gameRef = doc(db, COLLECTIONS.GAMES, game.id)
        await updateDoc(gameRef, {
          current_question_index: nextIndex,
          game_phase: 'question',
          time_left: nextQ?.timeLimit || 30
        })
        
        setCurrentQuestionIndex(nextIndex)
        setTimeLeft(nextQ?.timeLimit || 30)
        setGamePhase('question')
        setIsPlaying(true)
        
        console.log(`Moving to question ${nextIndex + 1} - all players will see this`)
      } else {
        // Game finished
        const gameRef = doc(db, COLLECTIONS.GAMES, game.id)
        await updateDoc(gameRef, {
          status: 'finished',
          game_phase: 'final',
          ended_at: serverTimestamp()
        })
        
        setGamePhase('final')
        console.log('Game finished - showing final results')
      }
    } catch (error) {
      console.error('Error moving to next question:', error)
      alert('Failed to move to next question. Please try again.')
    }
  }

  const endGame = async () => {
    if (!game?.id) return
    
    try {
      // Update game status to finished
      const gameRef = doc(db, COLLECTIONS.GAMES, game.id)
      await updateDoc(gameRef, {
        status: 'finished',
        ended_at: serverTimestamp()
      })
      
      // Optionally clean up game sessions
      // const gameSessionsRef = collection(db, COLLECTIONS.GAME_SESSIONS)
      // const q = query(gameSessionsRef, where('gameId', '==', game.id))
      // const sessions = await getDocs(q)
      // const deletePromises = sessions.docs.map(doc => deleteDoc(doc.ref))
      // await Promise.all(deletePromises)
      
      alert('Game ended successfully!')
      window.location.href = '/dashboard'
    } catch (error) {
      console.error('Error ending game:', error)
      alert('Failed to end game. Please try again.')
    }
  }

  const toggleGameSettings = () => {
    // For now, just show an alert with current settings
    const settingsInfo = `
Game Settings:
- PIN: ${gamePin}
- Quiz: ${quiz?.title || 'Loading...'}
- Players: ${displayPlayers.length}
- Status: ${gamePhase}
- Allow Players to Join: ${game?.settings?.allowPlayersToJoin !== false ? 'Yes' : 'No'}
`
    alert(settingsInfo)
  }

  const showResults = () => {
    setGamePhase('results')
    setIsPlaying(false)
  }

  const answerColors = ['bg-kahoot-red', 'bg-kahoot-blue', 'bg-kahoot-yellow', 'bg-kahoot-green']
  const answerSymbols = ['▲', '♦', '●', '■']

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-black/50 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-kahoot-purple rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold">K!</span>
          </div>
          <div>
            <h1 className="font-bold text-lg">{quiz?.title || 'Loading...'}</h1>
            <p className="text-sm text-gray-300">PIN: {gamePin}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span className="font-semibold">{displayPlayers.length}</span>
          </div>
          <Button variant="outline" size="sm" onClick={toggleGameSettings}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" size="sm" onClick={endGame}>
            <Home className="w-4 h-4 mr-2" />
            End Game
          </Button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Main Display Area */}
        <div className="flex-1 flex flex-col">
          {gamePhase === 'waiting' && (
            <div className="flex-1 bg-gradient-to-br from-kahoot-purple via-kahoot-blue to-kahoot-pink relative overflow-hidden">
              {/* Decorative flowing background elements */}
              <div className="absolute inset-0">
                <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.3" />
                      <stop offset="50%" stopColor="#ff006e" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#8338ec" stopOpacity="0.3" />
                    </linearGradient>
                  </defs>
                  <path d="M0,200 Q300,100 600,150 T1200,200 L1200,800 L0,800 Z" fill="url(#wave1)" />
                  <path d="M0,400 Q400,300 800,350 T1200,400 L1200,800 L0,800 Z" fill="rgba(255,0,110,0.1)" />
                  <path d="M0,600 Q200,500 400,550 T800,600 Q1000,650 1200,600 L1200,800 L0,800 Z" fill="rgba(0,212,255,0.15)" />
                </svg>
              </div>

              <div className="relative z-10 flex flex-col items-center justify-center h-full p-8">
                {/* Header Section with PIN and QR */}
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-8">
                  {/* Join Instructions and PIN */}
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl">
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-gray-700 text-sm mb-1">Join at <span className="font-bold">www.kahoot.it</span></p>
                        <p className="text-gray-600 text-xs">or with the Kahoot! app</p>
                      </div>
                      <div className="border-l border-gray-300 pl-6">
                        <p className="text-gray-700 text-sm font-medium mb-1">Game PIN:</p>
                        <p className="text-4xl font-bold text-gray-900 tracking-wider">{gamePin}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* QR Code Placeholder */}
                  <div className="bg-white rounded-lg p-4 shadow-2xl">
                    <div className="w-20 h-20 bg-gray-900 rounded-lg flex items-center justify-center">
                      <div className="grid grid-cols-4 gap-1">
                        {Array.from({ length: 16 }).map((_, i) => (
                          <div key={i} className={`w-1 h-1 ${Math.random() > 0.5 ? 'bg-white' : 'bg-gray-900'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="flex flex-col items-center mt-32">
                  {/* Kahoot Logo */}
                  <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 mb-8">
                    <div className="text-6xl font-bold text-white tracking-wider">kahoot!</div>
                  </div>

                  {/* Hexagonal Container for Game Info */}
                  <div className="relative">
                    {/* Hexagon Background */}
                    <div className="w-96 h-80 bg-white/95 backdrop-blur-sm" style={{
                      clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                    }}>
                      <div className="flex flex-col items-center justify-center h-full p-12">
                        {displayPlayers.length === 0 ? (
                          <>
                            {/* Empty State - Waiting for participants */}
                            <div className="mb-6">
                              <div className="w-16 h-4 bg-kahoot-blue rounded-full mb-4 mx-auto"></div>
                              <div className="w-20 h-4 bg-kahoot-blue rounded-full mb-6 mx-auto"></div>
                            </div>
                            <p className="text-2xl font-bold text-gray-800 mb-2">Waiting for participants</p>
                            <p className="text-sm text-gray-600 mb-4">No players have joined yet</p>
                            <div className="text-center">
                              <p className="text-lg font-bold text-gray-900">{quiz?.title || 'Loading...'}</p>
                              <p className="text-sm text-gray-600 uppercase tracking-wide">Quiz Topic</p>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Show Players */}
                            <div className="mb-4">
                              <div className="flex flex-wrap justify-center gap-2 mb-4">
                                {displayPlayers.slice(0, 6).map((player, index) => {
                                  // Assign a consistent avatar based on player ID or index
                                  const avatarIds = ['boy', 'girl', 'geek', 'woman', 'superhero', 'chinese', 'otaku', 'employee', 'chess', 'cosplayer']
                                  const avatarId = player.avatarId || avatarIds[index % avatarIds.length]
                                  
                                  return (
                                    <div key={player.id} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                                      <div className="w-8 h-8 mr-2">
                                        <Avatar avatarId={avatarId} size="sm" className="w-full h-full" />
                                      </div>
                                      <span className="text-sm font-medium text-gray-800">{player.nickname}</span>
                                    </div>
                                  )
                                })}
                                {displayPlayers.length > 6 && (
                                  <div className="flex items-center bg-gray-200 rounded-full px-3 py-1">
                                    <span className="text-sm font-medium text-gray-600">+{displayPlayers.length - 6} more</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold text-gray-900">{quiz?.title || 'Loading...'}</p>
                              <p className="text-sm text-gray-600 uppercase tracking-wide">Quiz Topic</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Controls in top right */}
                <div className="absolute top-8 right-8 flex items-center space-x-4">
                  {/* Player counter */}
                  <div className="bg-black/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-2 text-white">
                    <Users className="w-4 h-4" />
                    <span className="font-bold">{displayPlayers.length}</span>
                  </div>
                  
                  {/* Lock/Settings button */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
                    onClick={toggleGameSettings}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  
                  {/* Start button */}
                  <Button 
                    onClick={startGame} 
                    className="bg-white/90 text-gray-900 hover:bg-white font-semibold px-6 py-2"
                    disabled={displayPlayers.length === 0}
                  >
                    Start
                  </Button>
                </div>
              </div>
            </div>
          )}

          {gamePhase === 'question' && (
            <div className="flex-1 flex flex-col justify-center p-8">
              {/* Question Header */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                    timeLeft <= 5 ? 'bg-red-500 animate-pulse' : timeLeft <= 10 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}>
                    {timeLeft}
                  </div>
                  <span className="text-xl text-gray-300">
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                  </span>
                </div>
                
                <h1 className="text-4xl md:text-6xl font-bold mb-4">
                  {currentQuestion.question}
                </h1>
              </div>

              {/* Answer Options */}
              <div className="grid grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
                {currentQuestion.answers.map((answer: any, index: number) => (
                  <div
                    key={answer.id}
                    className={`${answerColors[index]} rounded-2xl p-8 flex items-center justify-center min-h-[120px] shadow-2xl`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2">{answerSymbols[index]}</div>
                      <div className="text-xl font-bold">{answer.text}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center space-x-4 mt-8">
                <Button onClick={pauseGame} variant="outline">
                  {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {isPlaying ? 'Pause' : 'Resume'}
                </Button>
                <Button onClick={showResults}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Show Results
                </Button>
                <Button onClick={nextQuestion} disabled={currentQuestionIndex >= totalQuestions - 1}>
                  <SkipForward className="w-4 h-4 mr-2" />
                  Next Question
                </Button>
              </div>
            </div>
          )}

          {gamePhase === 'results' && (
            <div className="flex-1 relative">
              <LeaderboardReveal
                gameId={game.id} 
                playerNickname="Host View"
                currentQuestionIndex={currentQuestionIndex}
                onComplete={() => {
                  console.log('Leaderboard reveal completed');
                }}
                className="min-h-full"
              />
              
              {/* Next Question Button Overlay */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <Button onClick={nextQuestion} className="text-xl py-4 px-8 bg-white/90 text-gray-900 hover:bg-white">
                  {currentQuestionIndex >= totalQuestions - 1 ? (
                    <>
                      <Trophy className="w-6 h-6 mr-2" />
                      Show Final Results
                    </>
                  ) : (
                    <>
                      <SkipForward className="w-6 h-6 mr-2" />
                      Next Question
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {gamePhase === 'final' && (
            <div className="flex-1 flex flex-col p-8">
              {/* Final Results Header */}
              <div className="text-center mb-8">
                <div className="w-32 h-32 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trophy className="w-16 h-16 text-yellow-800" />
                </div>
                <h1 className="text-5xl font-bold mb-4">Final Results!</h1>
                <p className="text-xl text-gray-300 mb-4">
                  {quiz?.title} - Game PIN: {gamePin}
                </p>
                <p className="text-lg text-gray-400">
                  {displayPlayers.length} players participated
                </p>
              </div>

              {/* Winner Podium */}
              <div className="max-w-4xl mx-auto mb-8">
                <h2 className="text-3xl font-bold text-center mb-6">🏆 Champions 🏆</h2>
                <div className="flex justify-center items-end space-x-4 mb-8">
                  {displayPlayers
                    .sort((a: any, b: any) => (b.score || 0) - (a.score || 0))
                    .slice(0, 3)
                    .map((player: any, index: number) => {
                      const position = index + 1
                      const height = position === 1 ? 'h-32' : position === 2 ? 'h-24' : 'h-20'
                      const bgColor = position === 1 ? 'bg-yellow-500' : position === 2 ? 'bg-gray-400' : 'bg-amber-600'
                      const textColor = position === 1 ? 'text-yellow-900' : position === 2 ? 'text-gray-900' : 'text-amber-900'
                      
                      return (
                        <div key={player.id} className="text-center">
                          <div className="mb-4">
                            <div className="text-4xl mb-2">
                              {position === 1 ? '🥇' : position === 2 ? '🥈' : '🥉'}
                            </div>
                            <div className="font-bold text-lg">{player.nickname}</div>
                            <div className="text-2xl font-bold text-yellow-400">{player.score || 0}</div>
                            <div className="text-sm text-gray-400">points</div>
                          </div>
                          <div className={`${bgColor} ${textColor} ${height} w-24 rounded-t-lg flex items-end justify-center pb-2 font-bold`}>
                            #{position}
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>

              {/* Complete Leaderboard */}
              <div className="max-w-4xl mx-auto mb-8">
                <h3 className="text-2xl font-bold text-center mb-6">Complete Leaderboard</h3>
                <div className="bg-gray-800 rounded-2xl p-6 max-h-96 overflow-y-auto">
                  {displayPlayers
                    .sort((a: any, b: any) => (b.score || 0) - (a.score || 0))
                    .map((player: any, index: number) => {
                      const correctAnswers = Object.values(player.answers || {}).filter((answer: any) => answer.isCorrect).length
                      const totalAnswers = Object.keys(player.answers || {}).length
                      const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0
                      
                      return (
                        <div key={player.id} className={`flex items-center justify-between p-4 rounded-lg mb-2 ${
                          index < 3 ? 'bg-yellow-900/30 border-2 border-yellow-500/50' : 'bg-gray-700'
                        }`}>
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                              index === 0 ? 'bg-yellow-500 text-yellow-900' :
                              index === 1 ? 'bg-gray-400 text-gray-900' :
                              index === 2 ? 'bg-amber-600 text-amber-900' :
                              'bg-gray-600 text-white'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-bold text-lg">{player.nickname}</div>
                              <div className="text-sm text-gray-400">
                                {correctAnswers}/{totalAnswers} correct ({accuracy}% accuracy)
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-2xl font-bold text-yellow-400">{player.score || 0}</div>
                            <div className="text-sm text-gray-400">points</div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>

              {/* Game Statistics */}
              <div className="max-w-4xl mx-auto mb-8">
                <h3 className="text-2xl font-bold text-center mb-6">Game Statistics</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-gray-800 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-blue-400">{displayPlayers.length}</div>
                    <div className="text-sm text-gray-400">Total Players</div>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-green-400">{totalQuestions}</div>
                    <div className="text-sm text-gray-400">Questions</div>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-yellow-400">
                      {displayPlayers.length > 0 ? Math.round(
                        displayPlayers.reduce((sum: number, p: any) => {
                          const correct = Object.values(p.answers || {}).filter((a: any) => a.isCorrect).length
                          const total = Object.keys(p.answers || {}).length
                          return sum + (total > 0 ? (correct / total) * 100 : 0)
                        }, 0) / displayPlayers.length
                      ) : 0}%
                    </div>
                    <div className="text-sm text-gray-400">Avg. Accuracy</div>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-purple-400">
                      {displayPlayers.length > 0 ? Math.round(
                        displayPlayers.reduce((sum: number, p: any) => sum + (p.score || 0), 0) / displayPlayers.length
                      ) : 0}
                    </div>
                    <div className="text-sm text-gray-400">Avg. Score</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="text-center space-x-4">
                <Button 
                  onClick={() => {
                    // Generate and download detailed report
                    const reportData = {
                      quiz: quiz?.title,
                      gamePin: gamePin,
                      totalPlayers: displayPlayers.length,
                      questions: totalQuestions,
                      players: displayPlayers.map((p: any, index: number) => ({
                        rank: index + 1,
                        nickname: p.nickname,
                        score: p.score || 0,
                        answers: p.answers || {},
                        accuracy: Object.keys(p.answers || {}).length > 0 ? 
                          Math.round((Object.values(p.answers || {}).filter((a: any) => a.isCorrect).length / Object.keys(p.answers || {}).length) * 100) : 0
                      })).sort((a, b) => b.score - a.score),
                      gameStatistics: {
                        averageAccuracy: displayPlayers.length > 0 ? Math.round(
                          displayPlayers.reduce((sum: number, p: any) => {
                            const correct = Object.values(p.answers || {}).filter((a: any) => a.isCorrect).length
                            const total = Object.keys(p.answers || {}).length
                            return sum + (total > 0 ? (correct / total) * 100 : 0)
                          }, 0) / displayPlayers.length
                        ) : 0,
                        averageScore: displayPlayers.length > 0 ? Math.round(
                          displayPlayers.reduce((sum: number, p: any) => sum + (p.score || 0), 0) / displayPlayers.length
                        ) : 0
                      }
                    }
                    
                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2))
                    const downloadAnchorNode = document.createElement('a')
                    downloadAnchorNode.setAttribute("href", dataStr)
                    downloadAnchorNode.setAttribute("download", `kahoot-results-${gamePin}-${new Date().toISOString().split('T')[0]}.json`)
                    document.body.appendChild(downloadAnchorNode)
                    downloadAnchorNode.click()
                    downloadAnchorNode.remove()
                  }}
                  variant="outline"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
                <Button onClick={() => window.location.href = '/dashboard'}>
                  <Home className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Player List & Stats */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto">
          <div className="p-4 border-b border-gray-700">
            <h2 className="font-bold text-lg mb-4">Live Stats</h2>
            <RealTimeCounter gameId={game.id} />
          </div>

          <div className="p-4">
            <h3 className="font-bold mb-4">Live Leaderboard</h3>
            <AnimatedLeaderboard gameId={game.id} showPositionChanges={true} maxPlayers={8} />
          </div>
          
          <div className="p-4">
            <PlayerStatus 
              gameId={game.id} 
              currentQuestionIndex={currentQuestionIndex}
              timeLeft={timeLeft}
            />
          </div>
        </div>
      </div>
    </div>
  )
}