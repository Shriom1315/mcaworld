'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Play, Users, PlusCircle, Gamepad2, Star, Zap } from 'lucide-react'

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [gamePin, setGamePin] = useState('')

  const handleJoinGame = (e: React.FormEvent) => {
    e.preventDefault()
    if (gamePin.trim()) {
      window.location.href = `/join?pin=${gamePin}`
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-pixel-grid bg-pixel-grid opacity-10 pointer-events-none"></div>
      
      {/* Floating pixel elements */}
      <div className="absolute top-10 left-10 w-8 h-8 bg-pixel-yellow animate-pixel-float" style={{animationDelay: '0s'}}></div>
      <div className="absolute top-20 right-20 w-6 h-6 bg-pixel-pink animate-pixel-float" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-20 left-1/4 w-4 h-4 bg-pixel-cyan animate-pixel-float" style={{animationDelay: '2s'}}></div>
      <div className="absolute bottom-32 right-1/3 w-8 h-8 bg-pixel-green animate-pixel-float" style={{animationDelay: '3s'}}></div>
      
      {/* Navigation */}
      <nav className="relative z-20 px-4 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Pixel-art logo */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-pixel-yellow border-3 border-black flex items-center justify-center relative animate-pixel-glow">
              <Gamepad2 className="w-6 h-6 text-black" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-pixel-red border border-black"></div>
            </div>
            <div className="text-2xl font-pixel text-white drop-shadow-lg">
              QUIZ<span className="text-pixel-yellow">!</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/create" className="btn-pixel-purple text-xs">
              CREATE
            </Link>
            <Link href="/discover" className="btn-pixel-cyan text-xs">
              DISCOVER
            </Link>
            <Link href="/auth/login" className="btn-pixel-yellow text-xs">
              LOGIN
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden btn-pixel-pink text-xs"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            MENU
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-4 right-4 z-30 animate-dialog-appear">
            <div className="pixel-card mt-4 space-y-3">
              <Link href="/create" className="block btn-pixel-purple text-xs w-full">
                CREATE
              </Link>
              <Link href="/discover" className="block btn-pixel-cyan text-xs w-full">
                DISCOVER
              </Link>
              <Link href="/auth/login" className="block btn-pixel-yellow text-xs w-full">
                LOGIN
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <main className="px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Main Title */}
          <div className="text-center mb-12 animate-dialog-appear">
            <div className="relative inline-block">
              <h1 className="text-6xl md:text-8xl font-pixel text-white mb-4 drop-shadow-lg animate-pixel-glow">
                LET'S PLAY
              </h1>
              <h2 className="text-4xl md:text-6xl font-pixel text-pixel-yellow mb-8 drop-shadow-lg">
                GAME
              </h2>
              
              {/* Decorative pixel elements around title */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-pixel-green border-2 border-black animate-character-bob"></div>
              <div className="absolute -top-4 -right-4 w-6 h-6 bg-pixel-red border-2 border-black animate-character-bob" style={{animationDelay: '0.5s'}}></div>
              <div className="absolute -bottom-4 left-1/4 w-4 h-4 bg-pixel-cyan border-2 border-black animate-character-bob" style={{animationDelay: '1s'}}></div>
              <div className="absolute -bottom-4 right-1/4 w-6 h-6 bg-pixel-pink border-2 border-black animate-character-bob" style={{animationDelay: '1.5s'}}></div>
            </div>
            
            <p className="text-lg md:text-xl text-white font-mono mb-8 max-w-2xl mx-auto bg-black/20 p-4 border-2 border-white/30">
              {'>'}  Welcome to the ultimate quiz adventure!
              <span className="animate-retro-blink">█</span>
            </p>
          </div>

          {/* Game PIN Input - Styled as retro dialog */}
          <div className="max-w-md mx-auto mb-16 animate-dialog-appear" style={{animationDelay: '0.5s'}}>
            <div className="dialog-box bg-white relative">
              <h2 className="text-2xl font-pixel text-black mb-6 text-center">JOIN GAME</h2>
              
              {/* Pixel character */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-pixel-purple border-3 border-black flex items-center justify-center animate-character-bob">
                  <div className="w-8 h-8 bg-pixel-yellow border border-black"></div>
                </div>
              </div>
              
              <form onSubmit={handleJoinGame} className="space-y-4">
                <input
                  type="text"
                  placeholder="ENTER PIN"
                  value={gamePin}
                  onChange={(e) => setGamePin(e.target.value)}
                  className="w-full input-pixel font-mono text-center uppercase"
                  maxLength={6}
                  pattern="\d{6}"
                />
                <button 
                  type="submit"
                  className="w-full btn-pixel-green font-pixel text-sm"
                >
                  ENTER GAME
                </button>
              </form>
              
              {/* Dialog decoration */}
              <div className="absolute top-2 right-2 w-3 h-3 bg-pixel-red border border-black"></div>
              <div className="absolute bottom-2 left-2 w-3 h-3 bg-pixel-blue border border-black"></div>
            </div>
          </div>

          {/* Feature Cards - Pixel Art Style */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Play Card */}
            <div className="game-screen bg-pixel-blue animate-dialog-appear" style={{animationDelay: '1s'}}>
              <div className="text-center">
                <div className="w-20 h-20 bg-pixel-yellow border-3 border-black mx-auto mb-4 flex items-center justify-center animate-pixel-pulse">
                  <Play className="w-10 h-10 text-black" />
                </div>
                <h3 className="text-2xl font-pixel text-white mb-4">PLAY</h3>
                <p className="text-white font-mono text-sm leading-relaxed">
                  {'>'}  Join exciting quiz battles<br/>
                  {'>'}  Answer with your device<br/>
                  {'>'}  Beat other players!
                </p>
                <div className="mt-4">
                  <Link href="/join" className="btn-pixel-yellow text-xs">
                    JOIN NOW
                  </Link>
                </div>
              </div>
            </div>

            {/* Create Card */}
            <div className="game-screen bg-pixel-green animate-dialog-appear" style={{animationDelay: '1.2s'}}>
              <div className="text-center">
                <div className="w-20 h-20 bg-pixel-white border-3 border-black mx-auto mb-4 flex items-center justify-center animate-pixel-pulse">
                  <PlusCircle className="w-10 h-10 text-black" />
                </div>
                <h3 className="text-2xl font-pixel text-white mb-4">CREATE</h3>
                <p className="text-white font-mono text-sm leading-relaxed">
                  {'>'}  Build epic quizzes<br/>
                  {'>'}  Add cool questions<br/>
                  {'>'}  Share with friends!
                </p>
                <div className="mt-4">
                  <Link href="/create" className="btn-pixel-yellow text-xs">
                    CREATE NOW
                  </Link>
                </div>
              </div>
            </div>

            {/* Host Card */}
            <div className="game-screen bg-pixel-red animate-dialog-appear" style={{animationDelay: '1.4s'}}>
              <div className="text-center">
                <div className="w-20 h-20 bg-pixel-yellow border-3 border-black mx-auto mb-4 flex items-center justify-center animate-pixel-pulse">
                  <Users className="w-10 h-10 text-black" />
                </div>
                <h3 className="text-2xl font-pixel text-white mb-4">HOST</h3>
                <p className="text-white font-mono text-sm leading-relaxed">
                  {'>'}  Control the game<br/>
                  {'>'}  Watch live results<br/>
                  {'>'}  Manage players!
                </p>
                <div className="mt-4">
                  <Link href="/dashboard" className="btn-pixel-yellow text-xs">
                    HOST NOW
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center animate-dialog-appear" style={{animationDelay: '1.6s'}}>
            <div className="pixel-card max-w-2xl mx-auto">
              <h2 className="text-4xl font-pixel text-black mb-6">READY PLAYER?</h2>
              
              {/* Pixel characters */}
              <div className="flex justify-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-pixel-purple border-2 border-black animate-character-bob"></div>
                <div className="w-12 h-12 bg-pixel-pink border-2 border-black animate-character-bob" style={{animationDelay: '0.3s'}}></div>
                <div className="w-12 h-12 bg-pixel-cyan border-2 border-black animate-character-bob" style={{animationDelay: '0.6s'}}></div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signup" className="btn-pixel-purple text-sm">
                  SIGN UP FREE
                </Link>
                <Link href="/create" className="btn-pixel-green text-sm">
                  START CREATING
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-12 px-4 border-t-5 border-black bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-pixel-yellow border-2 border-black flex items-center justify-center">
                <Gamepad2 className="w-4 h-4 text-black" />
              </div>
              <span className="text-xl font-pixel text-white">QUIZ GAME</span>
            </div>
            <p className="text-white/70 font-mono text-sm">
              © 2024 QUIZ GAME - MAKING LEARNING AWESOME!
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}