'use client'

import React from 'react'

interface BitWiseLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showText?: boolean
  text?: string
}

const BitWiseLoader = ({ 
  size = 'md', 
  className = '', 
  showText = true, 
  text = 'Loading...' 
}: BitWiseLoaderProps) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-12 h-12'
      case 'md':
        return 'w-16 h-16'
      case 'lg':
        return 'w-24 h-24'
      case 'xl':
        return 'w-32 h-32'
      default:
        return 'w-16 h-16'
    }
  }

  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return 'text-sm'
      case 'md':
        return 'text-lg'
      case 'lg':
        return 'text-xl'
      case 'xl':
        return 'text-2xl'
      default:
        return 'text-lg'
    }
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* SVG Loader Container */}
      <div className={`${getSizeClasses()} relative flex items-center justify-center`}>
        {/* BitWise-inspired animated loader */}
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Outer rotating ring */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 border-r-blue-500 animate-spin"></div>
          
          {/* Middle rotating ring */}
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-green-500 border-l-yellow-500 animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          
          {/* Inner content - BitWise logo representation */}
          <div className="relative z-10 w-2/3 h-2/3 flex flex-col items-center justify-center">
            {/* Top row of bits */}
            <div className="flex space-x-1 mb-1">
              <div className="w-2 h-2 bg-purple-500 rounded-sm animate-pulse" style={{animationDelay: '0s'}}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-sm animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 bg-green-500 rounded-sm animate-pulse" style={{animationDelay: '0.4s'}}></div>
              <div className="w-2 h-2 bg-yellow-500 rounded-sm animate-pulse" style={{animationDelay: '0.6s'}}></div>
            </div>
            
            {/* Middle row of bits */}
            <div className="flex space-x-1 mb-1">
              <div className="w-2 h-2 bg-red-500 rounded-sm animate-pulse" style={{animationDelay: '0.8s'}}></div>
              <div className="w-2 h-2 bg-purple-500 rounded-sm animate-pulse" style={{animationDelay: '1s'}}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-sm animate-pulse" style={{animationDelay: '1.2s'}}></div>
              <div className="w-2 h-2 bg-green-500 rounded-sm animate-pulse" style={{animationDelay: '1.4s'}}></div>
            </div>
            
            {/* Bottom row of bits */}
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-sm animate-pulse" style={{animationDelay: '1.6s'}}></div>
              <div className="w-2 h-2 bg-red-500 rounded-sm animate-pulse" style={{animationDelay: '1.8s'}}></div>
              <div className="w-2 h-2 bg-purple-500 rounded-sm animate-pulse" style={{animationDelay: '2s'}}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-sm animate-pulse" style={{animationDelay: '2.2s'}}></div>
            </div>
          </div>
          
          {/* Floating data particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-1 h-1 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full opacity-60`}
                style={{
                  left: `${20 + (i * 10)}%`,
                  top: `${20 + (i * 7)}%`,
                  animation: `float 3s ease-in-out infinite`,
                  animationDelay: `${i * 0.3}s`
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Add custom keyframes for floating animation */}
        <style jsx>{`
          @keyframes float {
            0%, 100% {
              transform: translateY(0px) rotate(0deg);
              opacity: 0.3;
            }
            50% {
              transform: translateY(-10px) rotate(180deg);
              opacity: 0.8;
            }
          }
        `}</style>
      </div>
      
      {/* Loading Text */}
      {showText && (
        <p className={`mt-4 font-medium text-center ${getTextSize()}`}>
          {text}
        </p>
      )}
    </div>
  )
}

export default BitWiseLoader