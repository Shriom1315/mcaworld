'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Play, Edit, Trash2, Users, BarChart3, Calendar, Filter, Grid, List, Trophy, Star, Zap, Target, GamepadIcon, Brain, Award, Rocket, Sparkles, Crown } from 'lucide-react'
import { collection, addDoc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { COLLECTIONS } from '@/types/firebase'

// Quiz interface for TypeScript
interface Quiz {
  id: string
  title: string
  description: string
  questions: any[]
  creator_id: string
  created_at: any
  updated_at: any
  is_published: boolean
}

// Mock user data - would come from authentication context
const mockUser = {
  username: 'teacher_demo',
  email: 'teacher@example.com',
  role: 'teacher'
}

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isHosting, setIsHosting] = useState(false)
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Clear any previous game session data when viewing dashboard
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Clear any stored game session data to ensure fresh start for new games
      localStorage.removeItem('kahoot_current_game_pin')
      localStorage.removeItem('kahoot_player_id')
      localStorage.removeItem('kahoot_nickname')
    }
  }, [])

  // Fetch quizzes from Firebase
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true)
        console.log('Fetching quizzes for user:', mockUser.email)
        
        const quizzesRef = collection(db, COLLECTIONS.QUIZZES)
        
        // First, let's try to get ALL quizzes to see what's in the database
        const allQuizzesSnapshot = await getDocs(quizzesRef)
        console.log('Total quizzes in database:', allQuizzesSnapshot.size)
        
        allQuizzesSnapshot.docs.forEach(doc => {
          console.log('Quiz doc:', doc.id, doc.data())
        })
        
        // Then try the filtered query
        const q = query(
          quizzesRef,
          where('creator_id', '==', mockUser.email),
          orderBy('created_at', 'desc')
        )
        
        const querySnapshot = await getDocs(q)
        console.log('Filtered quizzes found:', querySnapshot.size)
        
        const fetchedQuizzes: Quiz[] = querySnapshot.docs.map(doc => {
          const data = { id: doc.id, ...doc.data() }
          console.log('Fetched quiz:', data)
          return data
        }) as Quiz[]
        
        setQuizzes(fetchedQuizzes)
        console.log('Quizzes set to state:', fetchedQuizzes)
        
        // Log results without intrusive alerts
        if (fetchedQuizzes.length === 0) {
          console.log('No quizzes found for user, checking if any exist...')
          const allDocs = await getDocs(collection(db, COLLECTIONS.QUIZZES))
          console.log(`Found ${allDocs.size} total quizzes in database, but 0 for user ${mockUser.email}`)
        } else {
          console.log(`Successfully loaded ${fetchedQuizzes.length} quizzes!`)
        }
        
        // No mock data - only show real quizzes from Firebase
        // Users must create actual quizzes to see content
      } catch (error) {
        console.error('Error fetching quizzes:', error)
        
        // If the orderBy query fails, try without it
        try {
          console.log('Trying fallback query without orderBy...')
          const quizzesRef = collection(db, COLLECTIONS.QUIZZES)
          const fallbackQuery = query(
            quizzesRef,
            where('creator_id', '==', mockUser.email)
          )
          
          const fallbackSnapshot = await getDocs(fallbackQuery)
          console.log('Fallback query found:', fallbackSnapshot.size, 'quizzes')
          
          const fallbackQuizzes: Quiz[] = fallbackSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Quiz[]
          
          setQuizzes(fallbackQuizzes)
        } catch (fallbackError) {
          console.error('Fallback query also failed:', fallbackError)
          alert('Error loading quizzes. Please check the console and Firebase rules.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchQuizzes()
  }, [])

  // Filter quizzes based on search and category
  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         quiz.description.toLowerCase().includes(searchQuery.toLowerCase())
    // For now, we'll show all quizzes since we don't have category field in our schema
    const matchesCategory = selectedCategory === 'all' || true
    return matchesSearch && matchesCategory
  })

  // Get categories from quizzes (for now just show 'all')
  const categories = ['all']

  // Format date helper
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown'
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleDateString()
    } catch {
      return 'Unknown'
    }
  }

  // Get random emoji for quiz cover
  const getQuizEmoji = (index: number) => {
    const emojis = ['🧠', '📚', '🎯', '🎓', '💡', '🔬', '📐', '🌍', '🎨', '💭']
    return emojis[index % emojis.length]
  }

  const handlePlayQuiz = async (quizId: string) => {
    setIsHosting(true)
    try {
      // Generate a unique 6-digit PIN
      let pin: string
      let pinExists = true
      let attempts = 0
      const maxAttempts = 10

      do {
        pin = Math.floor(100000 + Math.random() * 900000).toString()
        const gamesRef = collection(db, COLLECTIONS.GAMES)
        const pinQuery = query(gamesRef, where('pin', '==', pin))
        const existingPins = await getDocs(pinQuery)
        pinExists = !existingPins.empty
        attempts++
      } while (pinExists && attempts < maxAttempts)

      if (pinExists) {
        alert('Failed to generate unique PIN. Please try again.')
        return
      }

      const now = Timestamp.now()
      const gameData = {
        pin,
        quiz_id: quizId,
        host_id: mockUser.email, // Using email as user ID for demo
        status: 'waiting',
        current_question_index: -1,
        players: [],
        created_at: now,
        started_at: null,
        ended_at: null,
        settings: {
          allowPlayersToJoin: true,
          showLeaderboard: true,
          randomizeQuestions: false,
          randomizeAnswers: false
        }
      }

      // Create game in Firestore (client-side)
      const gamesRef = collection(db, COLLECTIONS.GAMES)
      const docRef = await addDoc(gamesRef, gameData)

      // Redirect to host interface with the game PIN
      router.push(`/game/host/${pin}`)
      
    } catch (error: any) {
      console.error('Error creating game:', error)
      
      let errorMessage = 'Failed to create game. Please try again.'
      if (error.code === 'permission-denied') {
        errorMessage = 'Please deploy Firebase security rules first. Check FIRESTORE_RULES_SETUP.md'
      }
      
      alert(errorMessage)
    } finally {
      setIsHosting(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Retro OS Desktop Taskbar */}
      <div className="bg-gray-300 border-b-2 border-gray-600 px-2 py-1 flex items-center justify-between text-sm font-mono">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-gray-200 border border-gray-400 px-2 py-1">
            <BarChart3 className="w-4 h-4" />
            <span>Dashboard.exe</span>
          </div>
          <div className="text-xs text-gray-600">User: {mockUser.username}</div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>ONLINE</span>
          </div>
          <div className="bg-gray-200 border border-gray-400 px-2 py-1 text-xs">
            12:34 PM
          </div>
        </div>
      </div>

      {/* Desktop Area */}
      <div className="h-[calc(100vh-32px)] flex">
        {/* Main Dashboard Window */}
        <div className="flex-1 retro-window m-2">
          <div className="retro-window-header">
            <span>My Quiz Library - {quizzes.length} items</span>
            <div className="retro-window-controls">
              <div className="retro-window-control minimize">_</div>
              <div className="retro-window-control maximize">□</div>
            </div>
          </div>
          
          <div className="bg-white h-full flex flex-col">
            {/* Toolbar */}
            <div className="p-4 border-b-2 border-gray-300 bg-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                    <input
                      type="text"
                      placeholder="Search quizzes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-7 pr-3 py-1 border border-gray-400 font-mono text-sm focus:outline-none focus:border-blue-500 w-64"
                    />
                  </div>
                  
                  <div className="flex items-center bg-gray-200 border border-gray-400">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1 border-r border-gray-400 ${viewMode === 'grid' ? 'bg-blue-200' : 'hover:bg-gray-100'}`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1 ${viewMode === 'list' ? 'bg-blue-200' : 'hover:bg-gray-100'}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <a
                  href="/create"
                  className="px-4 py-2 bg-green-400 hover:bg-green-300 border-2 border-gray-600 font-mono font-bold flex items-center"
                  style={{boxShadow: '2px 2px 4px rgba(0,0,0,0.3)'}}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  NEW QUIZ
                </a>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="p-2 bg-white border border-gray-400 text-center">
                  <div className="font-mono text-lg font-bold">{quizzes.length}</div>
                  <div className="font-mono text-xs text-gray-600">TOTAL</div>
                </div>
                <div className="p-2 bg-white border border-gray-400 text-center">
                  <div className="font-mono text-lg font-bold">
                    {quizzes.reduce((sum, quiz) => sum + (quiz.questions?.length || 0), 0)}
                  </div>
                  <div className="font-mono text-xs text-gray-600">QUESTIONS</div>
                </div>
                <div className="p-2 bg-white border border-gray-400 text-center">
                  <div className="font-mono text-lg font-bold">{quizzes.filter(q => q.is_published).length}</div>
                  <div className="font-mono text-xs text-gray-600">PUBLISHED</div>
                </div>
                <div className="p-2 bg-white border border-gray-400 text-center">
                  <div className="font-mono text-lg font-bold">{quizzes.filter(quiz => {
                    const createdAt = quiz.created_at?.toDate ? quiz.created_at.toDate() : new Date(quiz.created_at)
                    const thisMonth = new Date()
                    thisMonth.setDate(1)
                    return createdAt >= thisMonth
                  }).length}</div>
                  <div className="font-mono text-xs text-gray-600">THIS MONTH</div>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-4 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="retro-window p-6">
                    <div className="retro-window-header">
                      <span>Loading Data</span>
                    </div>
                    <div className="p-4 text-center bg-white">
                      <div className="w-12 h-12 border-4 border-gray-400 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                      <div className="font-mono text-sm text-gray-700">LOADING QUIZZES...</div>
                    </div>
                  </div>
                </div>
              ) : filteredQuizzes.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="retro-window p-8">
                    <div className="retro-window-header">
                      <span>{searchQuery ? 'Search Results' : 'Getting Started'}</span>
                    </div>
                    <div className="p-6 text-center bg-white">
                      <div className="w-16 h-16 bg-yellow-200 border-2 border-gray-600 flex items-center justify-center mx-auto mb-4 font-mono text-2xl">
                        {searchQuery ? '?' : '+'}
                      </div>
                      <h2 className="font-mono text-lg font-bold text-gray-900 mb-2">
                        {searchQuery ? 'NO RESULTS FOUND' : 'CREATE YOUR FIRST QUIZ'}
                      </h2>
                      <p className="font-mono text-sm text-gray-600 mb-4">
                        {searchQuery ? 'Try different search terms' : 'Click the NEW QUIZ button to get started'}
                      </p>
                      {!searchQuery && (
                        <a
                          href="/create"
                          className="px-6 py-2 bg-green-400 hover:bg-green-300 border-2 border-gray-600 font-mono font-bold"
                          style={{boxShadow: '2px 2px 4px rgba(0,0,0,0.3)'}}
                        >
                          [+] CREATE QUIZ
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-3 gap-4' : 'space-y-2'}>
                  {filteredQuizzes.map((quiz, index) => (
                    <div
                      key={quiz.id}
                      className={`border-2 border-gray-400 bg-gray-50 hover:bg-gray-100 transition-all ${
                        viewMode === 'grid' ? 'p-4' : 'p-3 flex items-center space-x-4'
                      }`}
                      style={{boxShadow: '1px 1px 2px rgba(0,0,0,0.2)'}}
                    >
                      {viewMode === 'grid' ? (
                        <>
                          <div className="text-center mb-3">
                            <div className="w-12 h-12 bg-blue-200 border border-gray-400 flex items-center justify-center mx-auto mb-2 font-mono text-lg">
                              {getQuizEmoji(index)}
                            </div>
                            <div className="font-mono text-sm font-bold truncate">{quiz.title}</div>
                            <div className="font-mono text-xs text-gray-600">{quiz.questions?.length || 0} questions</div>
                          </div>
                          
                          <div className="space-y-2">
                            <button
                              onClick={() => handlePlayQuiz(quiz.id)}
                              disabled={isHosting}
                              className="w-full px-3 py-2 bg-blue-400 hover:bg-blue-300 border border-gray-600 font-mono text-xs font-bold disabled:opacity-50"
                            >
                              {isHosting ? 'STARTING...' : 'START GAME'}
                            </button>
                            <div className="flex space-x-1">
                              <button className="flex-1 px-2 py-1 bg-gray-300 hover:bg-gray-200 border border-gray-500 font-mono text-xs">
                                EDIT
                              </button>
                              <button className="flex-1 px-2 py-1 bg-red-300 hover:bg-red-200 border border-gray-500 font-mono text-xs">
                                DEL
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 bg-blue-200 border border-gray-400 flex items-center justify-center font-mono text-sm">
                            {getQuizEmoji(index)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-mono text-sm font-bold truncate">{quiz.title}</div>
                            <div className="font-mono text-xs text-gray-600">
                              {quiz.questions?.length || 0} Q • {formatDate(quiz.created_at)} • {quiz.is_published ? 'LIVE' : 'DRAFT'}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handlePlayQuiz(quiz.id)}
                              disabled={isHosting}
                              className="px-3 py-1 bg-blue-400 hover:bg-blue-300 border border-gray-600 font-mono text-xs font-bold disabled:opacity-50"
                            >
                              {isHosting ? 'STARTING...' : 'START'}
                            </button>
                            <button className="px-2 py-1 bg-gray-300 hover:bg-gray-200 border border-gray-500 font-mono text-xs">
                              EDIT
                            </button>
                            <button className="px-2 py-1 bg-red-300 hover:bg-red-200 border border-gray-500 font-mono text-xs">
                              DEL
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}