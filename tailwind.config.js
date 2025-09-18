/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Pixel-Art Gaming Palette
        pixel: {
          yellow: '#FFD700',
          'yellow-bright': '#FFED4A',
          'yellow-dark': '#B8860B',
          purple: '#8B5CF6',
          'purple-dark': '#6B46C1',
          'purple-deeper': '#553C9A',
          pink: '#FF69B4',
          'pink-bright': '#FF1493',
          'pink-dark': '#C71585',
          cyan: '#00FFFF',
          'cyan-dark': '#008B8B',
          green: '#00FF00',
          'green-dark': '#228B22',
          red: '#FF0000',
          'red-dark': '#DC143C',
          blue: '#0000FF',
          'blue-dark': '#000080',
          white: '#FFFFFF',
          black: '#000000',
          gray: {
            100: '#F5F5F5',
            200: '#E5E5E5',
            300: '#D4D4D4',
            400: '#A3A3A3',
            500: '#737373',
            600: '#525252',
            700: '#404040',
            800: '#262626',
            900: '#171717',
          }
        },
        // Keep original Kahoot colors for compatibility
        kahoot: {
          purple: '#46178F',
          blue: '#1368CE',
          red: '#E21B3C',
          green: '#26890C',
          orange: '#FA7921',
          yellow: '#FFA602',
          pink: '#FE2076',
          light: '#F7F7F7',
          dark: '#1D1D1D',
          gray: {
            100: '#F7F7F7',
            200: '#E0E0E0',
            300: '#C0C0C0',
            400: '#A0A0A0',
            500: '#808080',
            600: '#606060',
            700: '#404040',
            800: '#2D2D2D',
            900: '#1D1D1D',
          }
        }
      },
      fontFamily: {
        sans: ['Montserrat', 'Arial', 'sans-serif'],
        pixel: ['"Press Start 2P"', 'monospace'],
        mono: ['"Courier New"', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      backgroundImage: {
        'pixel-grid': 'linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)',
        'retro-gradient': 'linear-gradient(45deg, #FFD700, #FF69B4, #8B5CF6)',
        'game-bg': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
      backgroundSize: {
        'pixel-grid': '20px 20px',
      },
      boxShadow: {
        'pixel': '4px 4px 0px 0px rgba(0,0,0,0.8)',
        'pixel-lg': '6px 6px 0px 0px rgba(0,0,0,0.8)',
        'pixel-xl': '8px 8px 0px 0px rgba(0,0,0,0.8)',
        'retro': '0 0 20px rgba(255, 215, 0, 0.6)',
        'neon-pink': '0 0 20px rgba(255, 105, 180, 0.6)',
        'neon-purple': '0 0 20px rgba(139, 92, 246, 0.6)',
      },
      borderWidth: {
        '3': '3px',
        '5': '5px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-in': 'slideIn 0.6s ease-out forwards',
        'confetti': 'confetti linear infinite',
        'position-up': 'positionUp 1s ease-out',
        'position-down': 'positionDown 1s ease-out',
        'score-update': 'scoreUpdate 0.6s ease-out',
        // Pixel-art animations
        'pixel-pulse': 'pixelPulse 2s ease-in-out infinite',
        'pixel-bounce': 'pixelBounce 1s ease-in-out infinite',
        'pixel-glow': 'pixelGlow 2s ease-in-out infinite alternate',
        'retro-flash': 'retroFlash 0.5s ease-in-out infinite alternate',
        'dialog-appear': 'dialogAppear 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'character-walk': 'characterWalk 1s steps(4) infinite',
        'float': 'float 3s ease-in-out infinite',
        'glitch': 'glitch 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        confetti: {
          '0%': { transform: 'translateY(-100vh) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
        positionUp: {
          '0%, 50%': { transform: 'translateY(0) scale(1)' },
          '25%': { transform: 'translateY(-10px) scale(1.1)', boxShadow: '0 10px 20px rgba(34, 197, 94, 0.3)' },
          '75%': { transform: 'translateY(5px) scale(0.95)' },
          '100%': { transform: 'translateY(0) scale(1)' },
        },
        positionDown: {
          '0%, 50%': { transform: 'translateY(0) scale(1)' },
          '25%': { transform: 'translateY(10px) scale(0.9)', boxShadow: '0 5px 10px rgba(239, 68, 68, 0.3)' },
          '75%': { transform: 'translateY(-5px) scale(1.05)' },
          '100%': { transform: 'translateY(0) scale(1)' },
        },
        scoreUpdate: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)', color: '#fbbf24' },
          '100%': { transform: 'scale(1)' },
        },
        // Pixel-art keyframes
        pixelPulse: {
          '0%, 100%': { transform: 'scale(1)', filter: 'brightness(1)' },
          '50%': { transform: 'scale(1.05)', filter: 'brightness(1.2)' },
        },
        pixelBounce: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pixelGlow: {
          '0%': { boxShadow: '0 0 5px rgba(255, 215, 0, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(255, 215, 0, 1), 0 0 30px rgba(255, 215, 0, 0.8)' },
        },
        retroFlash: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0.7' },
        },
        dialogAppear: {
          '0%': { 
            opacity: '0',
            transform: 'scale(0.3) translateY(-50px)',
            filter: 'blur(10px)'
          },
          '60%': { 
            transform: 'scale(1.05) translateY(-5px)',
            filter: 'blur(0px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'scale(1) translateY(0px)',
            filter: 'blur(0px)'
          },
        },
        characterWalk: {
          '0%': { backgroundPosition: '0px 0px' },
          '100%': { backgroundPosition: '-128px 0px' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glitch: {
          '0%, 100%': { 
            transform: 'translate(0)',
            filter: 'hue-rotate(0deg)'
          },
          '20%': { 
            transform: 'translate(-2px, 2px)',
            filter: 'hue-rotate(90deg)'
          },
          '40%': { 
            transform: 'translate(-2px, -2px)',
            filter: 'hue-rotate(180deg)'
          },
          '60%': { 
            transform: 'translate(2px, 2px)',
            filter: 'hue-rotate(270deg)'
          },
          '80%': { 
            transform: 'translate(2px, -2px)',
            filter: 'hue-rotate(360deg)'
          },
        },
      },
    },
  },
  plugins: [],
}