'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Play, Edit, Trash2, Users, BarChart3, Calendar, Filter, Grid, List, Trophy, Star, Zap, Target, GamepadIcon, Brain, Award, Rocket, Sparkles, Crown } from 'lucide-react'
import { collection, addDoc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { COLLECTIONS } from '@/types/supabase'

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
    <div className="min-h-screen bg-gray-50">
      <Navbar user={mockUser} />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Library</h1>
          <p className="text-gray-600">Create, organize, and manage your kahoots</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-kahoot-purple/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-kahoot-purple" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{quizzes.length}</p>
                <p className="text-sm text-gray-600">Total Kahoots</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-kahoot-blue/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-kahoot-blue" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {quizzes.reduce((sum, quiz) => sum + (quiz.questions?.length || 0), 0)}
                </p>
                <p className="text-sm text-gray-600">Total Questions</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-kahoot-green/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-kahoot-green" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{quizzes.filter(quiz => {
                  const createdAt = quiz.created_at?.toDate ? quiz.created_at.toDate() : new Date(quiz.created_at)
                  const thisMonth = new Date()
                  thisMonth.setDate(1)
                  return createdAt >= thisMonth
                }).length}</p>
                <p className="text-sm text-gray-600">This Month</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-kahoot-orange/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-kahoot-orange" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{quizzes.filter(q => q.is_published).length}</p>
                <p className="text-sm text-gray-600">Published</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search kahoots..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kahoot-purple focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Create Button */}
              <a href="/create" className="btn-primary inline-flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Create Kahoot
              </a>
            </div>
          </div>
        </div>

        {/* Epic Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-kahoot-purple/30 border-t-kahoot-purple rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <GamepadIcon className="w-6 h-6 text-kahoot-purple animate-pulse" />
              </div>
            </div>
            <div className="mt-6 text-center">
              <h3 className="text-xl font-black text-kahoot-purple mb-2">Loading Epic Quests...</h3>
              <p className="text-gray-600 font-medium">🚀 Preparing your learning adventures!</p>
            </div>
          </div>
        ) : (
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
              : 'space-y-4'
          }`}>
            {filteredQuizzes.map((quiz, index) => (
              <div
                key={quiz.id}
                className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow ${
                  viewMode === 'list' ? 'flex items-center p-4' : 'overflow-hidden'
                }`}
              >
                {viewMode === 'grid' ? (
                  <>
                    {/* Quiz Cover */}
                    <div className="h-32 bg-gradient-to-br from-kahoot-purple to-kahoot-blue flex items-center justify-center">
                      <span className="text-4xl">{getQuizEmoji(index)}</span>
                    </div>

                    {/* Quiz Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{quiz.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{quiz.description || 'No description'}</p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span>{quiz.questions?.length || 0} questions</span>
                        <span>{formatDate(quiz.created_at)}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-kahoot-purple hover:bg-kahoot-purple/90 text-white font-semibold"
                          onClick={() => handlePlayQuiz(quiz.id)}
                          disabled={isHosting}
                        >
                          {isHosting ? (
                            <div className="flex items-center">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                              Creating...
                            </div>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-1" />
                              Start Game
                            </>
                          )}
                        </Button>
                        <button className="p-2 text-gray-500 hover:text-kahoot-purple">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-500 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* List View */}
                    <div className="w-16 h-16 bg-gradient-to-br from-kahoot-purple to-kahoot-blue rounded-lg flex items-center justify-center mr-4">
                      <span className="text-2xl">{getQuizEmoji(index)}</span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-black text-gray-900 text-lg group-hover:text-kahoot-purple transition-colors">{quiz.title}</h3>
                        <div className="flex items-center gap-1">
                          <Trophy className="w-4 h-4 text-kahoot-yellow" />
                          <span className="text-xs font-bold text-kahoot-purple bg-kahoot-yellow/20 px-2 py-1 rounded-full">LV.{index + 1}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{quiz.description || '🎮 Ready for an epic learning adventure!'}</p>
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1 text-kahoot-blue font-semibold">
                          <Target className="w-3 h-3" />
                          <span>{quiz.questions?.length || 0} challenges</span>
                        </div>
                        <span className="text-gray-500 font-medium">Created {formatDate(quiz.created_at)}</span>
                        <span className={`px-3 py-1 rounded-full font-bold text-xs ${
                          quiz.is_published ? 'bg-gradient-to-r from-green-400 to-green-500 text-white' : 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700'
                        }`}>
                          {quiz.is_published ? '🚀 Live' : '📝 Draft'}
                        </span>
                        <div className="flex items-center gap-1">
                          {[...Array(3)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-kahoot-yellow fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button 
                        size="sm"
                        className="bg-gradient-to-r from-kahoot-purple to-kahoot-blue hover:from-kahoot-blue hover:to-kahoot-purple text-white font-black py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        onClick={() => handlePlayQuiz(quiz.id)}
                        disabled={isHosting}
                      >
                        {isHosting ? (
                          <div className="flex items-center">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Launching...
                          </div>
                        ) : (
                          <>
                            <Rocket className="w-4 h-4 mr-2" />
                            Launch Battle!
                          </>
                        )}
                      </Button>
                      <button className="p-3 text-gray-500 hover:text-kahoot-purple bg-gray-100 hover:bg-kahoot-purple/10 rounded-xl transition-all duration-200 hover:scale-110">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-3 text-gray-500 hover:text-red-500 bg-gray-100 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Epic Empty State */}
        {!loading && filteredQuizzes.length === 0 && (
          <div className="text-center py-16">
            <div className="relative mx-auto mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-kahoot-purple via-kahoot-blue to-kahoot-pink rounded-full flex items-center justify-center mx-auto relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <div className="relative z-10">
                  {searchQuery ? (
                    <Search className="w-16 h-16 text-white" />
                  ) : quizzes.length === 0 ? (
                    <Rocket className="w-16 h-16 text-white animate-bounce-slow" />
                  ) : (
                    <Target className="w-16 h-16 text-white" />
                  )}
                </div>
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="w-8 h-8 text-kahoot-yellow animate-pulse" />
                </div>
              </div>
              <div className="flex justify-center gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 bg-kahoot-purple/30 rounded-full animate-pulse"
                    style={{animationDelay: `${i * 0.2}s`}}
                  ></div>
                ))}
              </div>
            </div>
            <h3 className="text-3xl font-black bg-gradient-to-r from-kahoot-purple to-kahoot-blue bg-clip-text text-transparent mb-4">
              {searchQuery 
                ? '🔍 No Quests Found!' 
                : quizzes.length === 0 
                  ? '🎮 Ready to Start Your Adventure?' 
                  : '🎯 No Matching Quests'
              }
            </h3>
            <p className="text-gray-600 mb-8 text-lg font-medium max-w-md mx-auto">
              {searchQuery 
                ? 'Try different keywords to discover epic learning quests! 💫' 
                : quizzes.length === 0 
                  ? 'Create your first epic learning quest and start your journey to knowledge mastery! 🚀'
                  : 'Adjust your filters to find the perfect learning adventure! ✨'
              }
            </p>
            <a href="/create" className="bg-gradient-to-r from-kahoot-purple via-kahoot-blue to-kahoot-pink hover:from-kahoot-pink hover:via-kahoot-purple hover:to-kahoot-blue text-white font-black py-4 px-8 rounded-2xl transition-all duration-500 transform hover:scale-110 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-kahoot-purple/50 inline-flex items-center group">
              <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center mr-3 group-hover:rotate-180 transition-transform duration-500">
                <Plus className="w-5 h-5" />
              </div>
              {quizzes.length === 0 ? 'Create Your First Epic Quest! 🎆' : 'Create New Adventure! ✨'}
              <Rocket className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
            </a>
          </div>
        )}
      </main>
    </div>
  )
}