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
        // Kahoot! Brand Colors
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
      },
    },
  },
  plugins: [],
}