# Kahoot! Clone - Interactive Learning Platform

# 🎮 Interactive Quiz Competition Platform

A modern, real-time quiz competition platform built with Next.js, featuring animated leaderboards, live player tracking, and spectacular visual effects. Create engaging educational experiences with real-time multiplayer functionality.

![Quiz Competition Platform](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-9-orange?style=for-the-badge&logo=firebase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css)

## 🚀 Features

### ✅ Completed Features

- **Homepage**: Clean, responsive design matching Kahoot!'s branding
- **Authentication**: Login/signup pages with social login options
- **Dashboard**: Quiz management interface with search and filtering
- **Quiz Creator**: Intuitive quiz creation with multiple question types
- **Game Flow**: Complete game experience including:
  - PIN-based game joining
  - Real-time game lobby
  - Player game interface with timed questions
  - Host interface with live controls
  - Results and leaderboard display
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **API Backend**: RESTful APIs for authentication, quiz management, and game flow

### 🎨 Design Features

- **Pixel-Perfect UI**: Exact replica of Kahoot!'s visual design
- **Color Palette**: Authentic Kahoot! colors (purple, blue, red, green, yellow)
- **Typography**: Modern, sans-serif fonts matching the original
- **Animations**: Smooth hover effects and transitions
- **Icons**: Comprehensive icon set using Lucide React

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Database**: Firebase (Firestore with real-time synchronization)
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage (for media uploads)
- **Styling**: Tailwind CSS with custom Kahoot! theme
- **Icons**: Lucide React
- **State Management**: React hooks and Firebase real-time
- **API**: Next.js API routes with Firebase Admin SDK
- **Development**: ESLint, TypeScript strict mode

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Firebase account (free tier available)

### 1. Clone and Install
```bash
git clone <repository-url>
cd kahoot-clone
npm install
```

### 2. Database Setup
1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Follow the detailed setup guide in [`FIREBASE_SETUP.md`](./FIREBASE_SETUP.md)
3. Copy `.env.local.example` to `.env.local` and fill in your Firebase credentials
4. Follow the implementation guide in [`FIREBASE_IMPLEMENTATION_GUIDE.md`](./FIREBASE_IMPLEMENTATION_GUIDE.md)

### 3. Run the Application
```bash
npm run dev
```

### 4. Open Your Browser
Navigate to `http://localhost:3000`

> **Important**: Make sure to complete the Firebase setup before running the application. The database configuration and authentication are required for full functionality.

## 🎮 How to Use

### For Teachers/Hosts:
1. **Sign up/Login** with teacher account
2. **Create a Quiz** using the intuitive quiz creator
3. **Host a Game** by starting a live session
4. **Share the PIN** displayed on your screen with students
5. **Control the Game** using the host interface

### For Students/Players:
1. **Join a Game** by entering the 6-digit PIN on the homepage
2. **Enter Your Nickname** and wait in the lobby
3. **Answer Questions** on your device as they appear on the main screen
4. **View Results** and your position on the leaderboard

## 🎯 Demo Instructions

### Development Mode (Mock Data)
For quick testing without database setup:
1. Comment out Firebase imports in API routes
2. Use the mock data already in the code
3. **Game PIN**: 123456
4. **Login**: Any email + password "password"

### Production Mode (Firebase)
With full database integration:
1. Complete Firebase setup (see `FIREBASE_SETUP.md`)
2. Implement Firebase services (see `FIREBASE_IMPLEMENTATION_GUIDE.md`)
3. Create an account through the signup page
4. Create quizzes in the dashboard
5. Start games and share PINs with players
6. Experience real-time gameplay with Firebase synchronization!

## 📱 Responsive Design

The application is fully responsive and provides optimal experience across:
- **Desktop**: Full-featured interface with all controls
- **Tablet**: Adapted layout for touch interaction
- **Mobile**: Optimized for phone gameplay

## 🔧 Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── api/               # Backend API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── create/            # Quiz creator
│   ├── game/              # Game-related pages
│   ├── join/              # Game joining flow
│   └── page.tsx           # Homepage
├── components/            # Reusable components
│   ├── ui/                # Basic UI components
│   ├── layout/            # Layout components
│   └── ...
├── lib/                   # Utility functions
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── styles/                # Global styles
```

## 🎨 Key Components

### Pages
- **Homepage** (`/`): Landing page with game PIN entry
- **Authentication** (`/auth/login`, `/auth/signup`): User registration and login
- **Dashboard** (`/dashboard`): Quiz library and management
- **Quiz Creator** (`/create`): Interactive quiz building interface
- **Game Join** (`/join`): PIN entry and nickname selection
- **Game Lobby** (`/game/lobby/[pin]`): Waiting room for players
- **Player Interface** (`/game/play/[pin]`): Question answering interface
- **Host Interface** (`/game/host/[pin]`): Game control and monitoring

### Components
- **Navbar**: Responsive navigation with user menu
- **Button**: Styled button component with variants
- **Input**: Form input with Kahoot! styling
- **Game Controls**: Timer, question display, answer options

## 🚀 Future Enhancements

The application now includes Firebase integration with real-time features! Additional enhancements planned:

- **Advanced Question Types**: True/false, type-answer, polls
- **Media Support**: Image and video uploads using Firebase Storage
- **Enhanced Analytics**: Detailed performance reports with Firebase Analytics
- **Team Mode**: Collaborative gameplay features
- **Custom Themes**: Branded quiz experiences
- **Mobile App**: Native iOS and Android applications with Firebase SDK
- **Advanced Real-time**: Live reactions, chat, and collaborative features
- **Gamification**: Achievements, badges, and progress tracking
- **Offline Support**: Firebase offline capabilities for better UX
- **Push Notifications**: Firebase Cloud Messaging for game alerts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is for educational purposes only. Kahoot! is a trademark of Kahoot! AS.

## 🙏 Acknowledgments

- [Kahoot!](https://kahoot.com) for the original design inspiration
- [Next.js](https://nextjs.org) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com) for the utility-first styling
- [Lucide](https://lucide.dev) for the beautiful icons

---

**Note**: This is a clone project created for educational purposes. It demonstrates modern web development practices and is not intended for commercial use.