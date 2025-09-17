'use client'

import React, { useState } from 'react'
import { Play, Users, Clock, Trophy, Heart, Share2, Edit, Star, Zap, Target } from 'lucide-react'

interface QuizCardProps {
  quiz: {
    id: string
    title: string
    description?: string
    questions: any[]
    creator_id: string
    created_at: any
    is_published: boolean
  }
  onPlay: (quizId: string) => void
  onEdit?: (quizId: string) => void
}

const QuizCard = ({ quiz, onPlay, onEdit }: QuizCardProps) => {
  const questionCount = quiz.questions?.length || 0
  const [isHovered, setIsHovered] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  
  // Calculate difficulty and stats
  const difficulty = questionCount <= 5 ? 'Easy' : questionCount <= 10 ? 'Medium' : 'Hard'
  const difficultyColor = questionCount <= 5 ? '#00D4AA' : questionCount <= 10 ? '#FFB800' : '#FF4757'
  const estimatedTime = Math.ceil(questionCount * 1.5) // 1.5 minutes per question
  const maxScore = questionCount * 100
  
  return (
    <div 
      className="game-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glassmorphism Header */}
      <div className="card-header">
        <div className="header-gradient">
          <div className="quiz-icon-container">
            <div className="quiz-icon">
              <Target className="main-icon" />
              <div className="pulse-ring"></div>
            </div>
          </div>
          
          <div className="question-count">
            <span className="count-number">{questionCount}</span>
            <span className="count-label">Questions</span>
          </div>
          
          <button 
            className="favorite-btn"
            onClick={() => setIsFavorited(!isFavorited)}
          >
            <Heart className={`heart-icon ${isFavorited ? 'favorited' : ''}`} />
          </button>
        </div>
      </div>
      
      {/* Card Content */}
      <div className="card-content">
        <div className="quiz-meta">
          <span className="brand-tag">BITWISE</span>
          <div className="difficulty-badge" style={{ backgroundColor: difficultyColor }}>
            {difficulty}
          </div>
        </div>
        
        <h3 className="quiz-title">{quiz.title}</h3>
        
        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-item">
            <Clock className="stat-icon" />
            <span className="stat-value">{estimatedTime}m</span>
            <span className="stat-label">Duration</span>
          </div>
          <div className="stat-item">
            <Trophy className="stat-icon" />
            <span className="stat-value">{maxScore}</span>
            <span className="stat-label">Max Score</span>
          </div>
          <div className="stat-item">
            <Users className="stat-icon" />
            <span className="stat-value">{questionCount * 12}</span>
            <span className="stat-label">Players</span>
          </div>
        </div>
        
        {/* Progress Indicators */}
        <div className="progress-section">
          <div className="difficulty-progress">
            <span className="progress-label">Difficulty Level</span>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: questionCount <= 5 ? '33%' : questionCount <= 10 ? '66%' : '100%',
                  backgroundColor: difficultyColor 
                }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Rating */}
        <div className="rating-section">
          <div className="stars">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`star ${i < 4 ? 'filled' : ''}`} />
            ))}
          </div>
          <span className="rating-text">4.0 ({questionCount * 47} reviews)</span>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="card-actions">
        <button 
          className="play-btn primary-btn"
          onClick={() => onPlay(quiz.id)}
        >
          <Play className="btn-icon" />
          <span>Play Now</span>
          <div className="btn-glow"></div>
        </button>
        
        <button 
          className="edit-btn secondary-btn"
          onClick={() => onEdit?.(quiz.id)}
        >
          <Edit className="btn-icon" />
        </button>
        
        <button className="share-btn secondary-btn">
          <Share2 className="btn-icon" />
        </button>
      </div>
      
      {/* Hover Effect Overlay */}
      <div className={`hover-overlay ${isHovered ? 'active' : ''}`}>
        <div className="hover-content">
          <Zap className="lightning-icon" />
          <span>Ready to Challenge?</span>
        </div>
      </div>

      <style jsx>{`
        .game-card {
          position: relative;
          width: 320px;
          height: 420px;
          background: linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 24px;
          padding: 0;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          box-shadow: 
            0 8px 32px rgba(0,0,0,0.1),
            0 2px 8px rgba(0,0,0,0.05),
            inset 0 1px 0 rgba(255,255,255,0.1);
        }

        .game-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 
            0 20px 40px rgba(0,0,0,0.15),
            0 8px 16px rgba(0,0,0,0.1),
            inset 0 1px 0 rgba(255,255,255,0.2);
          border-color: rgba(255,255,255,0.3);
        }

        .card-header {
          position: relative;
          height: 120px;
          overflow: hidden;
        }

        .header-gradient {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, 
            #667eea 0%, 
            #764ba2 25%,
            #667eea 50%,
            #f093fb 75%,
            #f5576c 100%
          );
          background-size: 400% 400%;
          animation: gradientShift 8s ease infinite;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
        }

        .quiz-icon-container {
          position: relative;
        }

        .quiz-icon {
          position: relative;
          width: 60px;
          height: 60px;
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,255,255,0.3);
        }

        .main-icon {
          width: 32px;
          height: 32px;
          color: white;
          z-index: 2;
        }

        .pulse-ring {
          position: absolute;
          top: -10px;
          left: -10px;
          right: -10px;
          bottom: -10px;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 20px;
          animation: pulse 2s ease-in-out infinite;
        }

        .question-count {
          text-align: center;
          color: white;
        }

        .count-number {
          display: block;
          font-size: 24px;
          font-weight: 800;
          line-height: 1;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .count-label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          opacity: 0.9;
          margin-top: 4px;
        }

        .favorite-btn {
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 12px;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .favorite-btn:hover {
          background: rgba(255,255,255,0.3);
          transform: scale(1.1);
        }

        .heart-icon {
          width: 20px;
          height: 20px;
          color: white;
          transition: all 0.3s ease;
        }

        .heart-icon.favorited {
          color: #ff4757;
          fill: #ff4757;
          animation: heartBeat 0.6s ease;
        }

        .card-content {
          padding: 24px;
          flex: 1;
        }

        .quiz-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .brand-tag {
          font-size: 11px;
          font-weight: 700;
          color: #8b5cf6;
          background: rgba(139, 92, 246, 0.1);
          padding: 4px 10px;
          border-radius: 20px;
          border: 1px solid rgba(139, 92, 246, 0.2);
        }

        .difficulty-badge {
          font-size: 11px;
          font-weight: 600;
          color: white;
          padding: 4px 10px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .quiz-title {
          font-size: 18px;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 20px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 20px;
        }

        .stat-item {
          text-align: center;
          background: rgba(247, 250, 252, 0.8);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(226, 232, 240, 0.5);
          border-radius: 12px;
          padding: 12px 8px;
          transition: all 0.3s ease;
        }

        .stat-item:hover {
          background: rgba(255, 255, 255, 0.9);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .stat-icon {
          width: 16px;
          height: 16px;
          color: #667eea;
          margin-bottom: 4px;
        }

        .stat-value {
          display: block;
          font-size: 14px;
          font-weight: 700;
          color: #2d3748;
          line-height: 1;
        }

        .stat-label {
          display: block;
          font-size: 10px;
          font-weight: 500;
          color: #718096;
          margin-top: 2px;
        }

        .progress-section {
          margin-bottom: 20px;
        }

        .progress-label {
          font-size: 12px;
          font-weight: 600;
          color: #4a5568;
          margin-bottom: 8px;
          display: block;
        }

        .progress-bar {
          height: 6px;
          background: rgba(226, 232, 240, 0.8);
          border-radius: 3px;
          overflow: hidden;
          position: relative;
        }

        .progress-fill {
          height: 100%;
          border-radius: 3px;
          transition: all 0.6s ease;
          position: relative;
          overflow: hidden;
        }

        .progress-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          animation: shimmer 2s infinite;
        }

        .rating-section {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
        }

        .stars {
          display: flex;
          gap: 2px;
        }

        .star {
          width: 14px;
          height: 14px;
          color: #e2e8f0;
          transition: all 0.2s ease;
        }

        .star.filled {
          color: #fbbf24;
          fill: currentColor;
        }

        .rating-text {
          font-size: 12px;
          font-weight: 500;
          color: #718096;
        }

        .card-actions {
          padding: 0 24px 24px;
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .primary-btn {
          flex: 1;
          position: relative;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          border-radius: 16px;
          padding: 14px 20px;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .primary-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }

        .btn-glow {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: all 0.6s ease;
        }

        .primary-btn:hover .btn-glow {
          left: 100%;
        }

        .secondary-btn {
          width: 48px;
          height: 48px;
          background: rgba(247, 250, 252, 0.8);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(226, 232, 240, 0.5);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .secondary-btn:hover {
          background: rgba(255, 255, 255, 0.9);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .btn-icon {
          width: 18px;
          height: 18px;
          color: #4a5568;
        }

        .primary-btn .btn-icon {
          color: white;
        }

        .hover-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.9), rgba(118, 75, 162, 0.9));
          backdrop-filter: blur(20px);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: all 0.4s ease;
          border-radius: 24px;
        }

        .hover-overlay.active {
          opacity: 1;
        }

        .hover-content {
          text-align: center;
          color: white;
          transform: translateY(20px);
          transition: all 0.4s ease;
        }

        .hover-overlay.active .hover-content {
          transform: translateY(0);
        }

        .lightning-icon {
          width: 48px;
          height: 48px;
          margin-bottom: 12px;
          animation: bounce 2s infinite;
        }

        .hover-content span {
          font-size: 18px;
          font-weight: 600;
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 0.4; }
          100% { transform: scale(1); opacity: 0.8; }
        }

        @keyframes heartBeat {
          0% { transform: scale(1); }
          25% { transform: scale(1.2); }
          50% { transform: scale(1.4); }
          75% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }

        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .game-card {
            background: linear-gradient(145deg, rgba(30,41,59,0.8), rgba(15,23,42,0.6));
            border-color: rgba(100,116,139,0.3);
          }
          
          .quiz-title {
            color: #e2e8f0;
          }
          
          .stat-item {
            background: rgba(30,41,59,0.6);
            border-color: rgba(100,116,139,0.3);
          }
          
          .secondary-btn {
            background: rgba(30,41,59,0.6);
            border-color: rgba(100,116,139,0.3);
          }
          
          .btn-icon {
            color: #94a3b8;
          }
        }
      `}</style>
    </div>
  )
}

export default QuizCard