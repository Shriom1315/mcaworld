'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Play, Users, PlusCircle, Gamepad2, Star, Zap, Trophy, Timer, Sparkles, Crown, Target } from 'lucide-react'

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [gamePin, setGamePin] = useState('')
  const [showStats, setShowStats] = useState(false)

  const handleJoinGame = (e: React.FormEvent) => {
    e.preventDefault()
    if (gamePin.trim()) {
      window.location.href = `/join?pin=${gamePin}`
    }
  }

  // Animated statistics for engagement
  useEffect(() => {
    const timer = setTimeout(() => setShowStats(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Modern gradient background with game show lighting */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10"></div>
      
      {/* Animated spotlight effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-radial from-yellow-400/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-20 right-1/4 w-80 h-80 bg-gradient-radial from-pink-400/20 to-transparent rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-gradient-radial from-cyan-400/20 to-transparent rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      
      {/* Floating game show elements */}
      <div className="absolute top-10 left-10 w-8 h-8 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
      <div className="absolute top-20 right-20 w-6 h-6 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-20 left-1/4 w-4 h-4 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '2s'}}></div>
      <div className="absolute bottom-32 right-1/3 w-8 h-8 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '3s'}}></div>
      
      {/* Modern Navigation */}
      <nav className="relative z-20 px-6 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Modern logo with game show flair */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-2xl border-2 border-white/20">
                <Trophy className="w-8 h-8 text-white drop-shadow-lg" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                TRIVIA SHOW
              </div>
              <div className="text-sm text-white/70 font-medium">Ultimate Quiz Experience</div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/create" className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 hover:scale-105">
              CREATE QUIZ
            </Link>
            <Link href="/discover" className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 hover:scale-105">
              DISCOVER
            </Link>
            <Link href="/auth/login" className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300">
              LOGIN
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            MENU
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-6 right-6 z-30 mt-4">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 space-y-4">
              <Link href="/create" className="block w-full px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-xl text-center">
                CREATE QUIZ
              </Link>
              <Link href="/discover" className="block w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl text-center">
                DISCOVER
              </Link>
              <Link href="/auth/login" className="block w-full px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-xl text-center">
                LOGIN
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section - Game Show Style */}
      <main className="px-6 py-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Main Title - Game Show Marquee Style */}
          <div className="text-center mb-16">
            <div className="relative inline-block">
              {/* Spotlight effect behind title */}
              <div className="absolute inset-0 bg-gradient-radial from-yellow-400/30 to-transparent rounded-full blur-3xl scale-150"></div>
              
              <div className="relative">
                <h1 className="text-7xl md:text-9xl font-black bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 bg-clip-text text-transparent mb-4 animate-pulse">
                  TRIVIA
                </h1>
                <h2 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent mb-8">
                  SHOWDOWN
                </h2>
                
                {/* Game show decorative elements */}
                <div className="absolute -top-8 -left-8 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-spin-slow flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-8 -right-8 w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full animate-spin-slow" style={{animationDelay: '0.5s', animationDirection: 'reverse'}}>
                  <Crown className="w-5 h-5 text-white m-2.5" />
                </div>
                <div className="absolute -bottom-8 left-1/4 w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full animate-spin-slow" style={{animationDelay: '1s'}}>
                  <Target className="w-4 h-4 text-white m-2" />
                </div>
                <div className="absolute -bottom-8 right-1/4 w-10 h-10 bg-gradient-to-br from-green-400 to-teal-500 rounded-full animate-spin-slow" style={{animationDelay: '1.5s', animationDirection: 'reverse'}}>
                  <Zap className="w-5 h-5 text-white m-2.5" />
                </div>
              </div>
            </div>
            
            <p className="text-xl md:text-2xl text-white/90 font-medium mb-12 max-w-3xl mx-auto bg-black/20 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
              🎮 Experience the ultimate quiz game show with real-time multiplayer action, synchronized timers, and instant results!
            </p>

            {/* Live Statistics */}
            {showStats && (
              <div className="flex justify-center space-x-8 mb-12">
                <div className="text-center">
                  <div className="text-3xl font-black text-yellow-400 mb-2 animate-bounce">10K+</div>
                  <div className="text-white/70 font-medium">Games Played</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-pink-400 mb-2 animate-bounce" style={{animationDelay: '0.2s'}}>50K+</div>
                  <div className="text-white/70 font-medium">Players</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-cyan-400 mb-2 animate-bounce" style={{animationDelay: '0.4s'}}>1M+</div>
                  <div className="text-white/70 font-medium">Questions</div>
                </div>
              </div>
            )}
          </div>

          {/* Game PIN Input - Modern Game Show Style */}
          <div className="max-w-lg mx-auto mb-20">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl">
                  <Play className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">JOIN THE GAME</h2>
                <p className="text-white/70">Enter your game PIN to start playing!</p>
              </div>
              
              <form onSubmit={handleJoinGame} className="space-y-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ENTER 6-DIGIT PIN"
                    value={gamePin}
                    onChange={(e) => setGamePin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-6 py-4 bg-white/5 border-2 border-white/20 rounded-2xl text-white text-center text-2xl font-bold placeholder-white/50 focus:border-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-400/20 transition-all duration-300"
                    maxLength={6}
                    pattern="\d{6}"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/10 to-yellow-400/0 rounded-2xl opacity-0 animate-pulse"></div>
                </div>
                <button 
                  type="submit"
                  disabled={gamePin.length !== 6}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold text-xl rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
                >
                  {gamePin.length === 6 ? '🚀 ENTER GAME' : `ENTER PIN (${gamePin.length}/6)`}
                </button>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-white/50 text-sm">Don't have a PIN? Create your own quiz!</p>
              </div>
            </div>
          </div>

          {/* Feature Cards - Modern Game Show Style */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {/* Play Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">MULTIPLAYER</h3>
                  <p className="text-white/70 mb-6 leading-relaxed">
                    🎮 Join live quiz battles<br/>
                    📱 Play on any device<br/>
                    🏆 Compete with friends<br/>
                    ⚡ Real-time synchronization
                  </p>
                  <Link href="/join" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105">
                    <Play className="w-4 h-4 mr-2" />
                    PLAY NOW
                  </Link>
                </div>
              </div>
            </div>

            {/* Create Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300">
                    <PlusCircle className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">CREATE</h3>
                  <p className="text-white/70 mb-6 leading-relaxed">
                    ✨ Build custom quizzes<br/>
                    🎯 Add multimedia content<br/>
                    📊 Track performance<br/>
                    🌍 Share with the world
                  </p>
                  <Link href="/create" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    CREATE QUIZ
                  </Link>
                </div>
              </div>
            </div>

            {/* Host Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300">
                    <Crown className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">HOST</h3>
                  <p className="text-white/70 mb-6 leading-relaxed">
                    🎪 Control the game show<br/>
                    📺 Manage live sessions<br/>
                    📈 View real-time results<br/>
                    🏁 Perfect timing control
                  </p>
                  <Link href="/dashboard" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105">
                    <Crown className="w-4 h-4 mr-2" />
                    HOST NOW
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action Section */}
          <div className="text-center mb-20">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-radial from-purple-500/20 to-transparent rounded-full blur-3xl scale-150"></div>
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-12 max-w-4xl mx-auto">
                <h2 className="text-5xl font-black bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-6">
                  READY TO DOMINATE?
                </h2>
                
                {/* Animated game show characters */}
                <div className="flex justify-center space-x-6 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl animate-bounce flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-red-500 rounded-2xl animate-bounce flex items-center justify-center" style={{animationDelay: '0.3s'}}>
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl animate-bounce flex items-center justify-center" style={{animationDelay: '0.6s'}}>
                    <Star className="w-8 h-8 text-white" />
                  </div>
                </div>
                
                <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                  Join thousands of players in the most engaging quiz experience ever created. 
                  Perfect timing, real-time competition, and instant results!
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Link href="/auth/signup" className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg rounded-2xl shadow-xl transition-all duration-300 hover:scale-105">
                    🎆 START FREE ACCOUNT
                  </Link>
                  <Link href="/create" className="px-8 py-4 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-bold text-lg rounded-2xl shadow-xl transition-all duration-300 hover:scale-105">
                    ✨ CREATE FIRST QUIZ
                  </Link>
                </div>
                
                <div className="mt-8 text-white/60 text-sm">
                  🆓 Free forever • 🚀 No setup required • 📱 Works on all devices
                </div>
              </div>
            </div>
          </div>

          {/* Features Highlight */}
          <div className="grid md:grid-cols-4 gap-6 mb-20">
            <div className="text-center p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <Timer className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-bold mb-2">Perfect Sync</h3>
              <p className="text-white/60 text-sm">Server-side timer ensures everyone sees the same countdown</p>
            </div>
            
            <div className="text-center p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-bold mb-2">Instant Results</h3>
              <p className="text-white/60 text-sm">Real-time leaderboards and immediate feedback</p>
            </div>
            
            <div className="text-center p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-bold mb-2">Unlimited Players</h3>
              <p className="text-white/60 text-sm">Host games for any number of participants</p>
            </div>
            
            <div className="text-center p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-teal-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-bold mb-2">Smart Analytics</h3>
              <p className="text-white/60 text-sm">Detailed performance insights and statistics</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-16 px-6 border-t border-white/10 bg-black/20 backdrop-blur-sm relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-xl">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                TRIVIA SHOW
              </span>
            </div>
            <p className="text-white/70 font-medium mb-4">
              The ultimate quiz game show experience with perfect synchronization
            </p>
            <div className="flex justify-center space-x-8 mb-6 text-sm text-white/60">
              <a href="#" className="hover:text-white transition-colors">About</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
            <p className="text-white/50 text-sm">
              © 2024 TRIVIA SHOW - Making learning extraordinary! 🎆
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}