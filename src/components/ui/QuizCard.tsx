'use client'

import React from 'react'
import { Play, Users, Clock, Trophy, Heart, Share2, Edit } from 'lucide-react'

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
  const difficultyColors = ['#26890C', '#FFA602', '#E21B3C'] // Easy, Medium, Hard
  const difficulty = questionCount <= 5 ? 0 : questionCount <= 10 ? 1 : 2
  const difficultyLabels = ['Easy', 'Medium', 'Hard']

  return (
    <div className="card">
      <div className="image-container">
        {/* Quiz Brain SVG */}
        <svg viewBox="0 0 240 240" className="svg">
          <defs>
            <radialGradient gradientUnits="objectBoundingBox" r="1.2" cy="0.5" cx="0.5" id="brain-gradient">
              <stop stopColor="#46178F" offset={0} />
              <stop stopColor="#1368CE" offset={0.5} />
              <stop stopColor="#26890C" offset={1} />
            </radialGradient>
          </defs>
          <rect fill="url(#brain-gradient)" width="240" height="240" rx="16" />
          
          {/* Brain illustration */}
          <g transform="translate(60, 60)">
            {/* Left brain hemisphere */}
            <path fill="rgba(255,255,255,0.9)" d="M20 40 C20 20, 40 10, 60 40 L60 100 C40 110, 20 100, 20 40 Z" />
            {/* Right brain hemisphere */}
            <path fill="rgba(255,255,255,0.9)" d="M60 40 C80 10, 100 20, 100 40 C100 100, 80 110, 60 100 Z" />
            
            {/* Brain details */}
            <path fill="rgba(70,23,143,0.3)" d="M30 50 Q50 45, 50 60 Q40 70, 30 65 Z" />
            <path fill="rgba(70,23,143,0.3)" d="M70 50 Q90 55, 90 65 Q80 70, 70 60 Z" />
            
            {/* Floating question marks */}
            <text x="35" y="25" fill="#FFA602" fontSize="18" fontWeight="bold" className="question-float">?</text>
            <text x="65" y="20" fill="#FFA602" fontSize="16" fontWeight="bold" className="question-float-2">?</text>
            <text x="85" y="30" fill="#FFA602" fontSize="14" fontWeight="bold" className="question-float-3">?</text>
          </g>
        </svg>
        
        <div className="difficulty-price">{questionCount} Questions</div>
      </div>
      
      <label className="favorite">
        <input type="checkbox" />
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000000">
          <path d="M12 20a1 1 0 0 1-.437-.1C11.214 19.73 3 15.671 3 9a5 5 0 0 1 8.535-3.536l.465.465.465-.465A5 5 0 0 1 21 9c0 6.646-8.212 10.728-8.562 10.9A1 1 0 0 1 12 20z" />
        </svg>
      </label>
      
      <div className="content">
        <div className="brand">BITWISE</div>
        <div className="product-name">{quiz.title}</div>
        
        <div className="color-size-container">
          <div className="colors">
            Type
            <ul className="colors-container">
              <li className="color active">
                <div className="color-dot" style={{ backgroundColor: '#46178F' }}></div>
                <span className="color-name">Multiple Choice</span>
              </li>
              <li className="color">
                <div className="color-dot" style={{ backgroundColor: '#1368CE' }}></div>
                <span className="color-name">True/False</span>
              </li>
              <li className="color">
                <div className="color-dot" style={{ backgroundColor: '#26890C' }}></div>
                <span className="color-name">Quiz</span>
              </li>
            </ul>
          </div>
          
          <div className="sizes">
            Difficulty
            <ul className="size-container">
              <li className="size">
                <label className="size-radio">
                  <input name={`difficulty-${quiz.id}`} value="easy" type="radio" checked={difficulty === 0} readOnly />
                  <span className="name">Easy</span>
                </label>
              </li>
              <li className="size">
                <label className="size-radio">
                  <input name={`difficulty-${quiz.id}`} value="medium" type="radio" checked={difficulty === 1} readOnly />
                  <span className="name">Med</span>
                </label>
              </li>
              <li className="size">
                <label className="size-radio">
                  <input name={`difficulty-${quiz.id}`} value="hard" type="radio" checked={difficulty === 2} readOnly />
                  <span className="name">Hard</span>
                </label>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="rating">
          <svg viewBox="0 0 99.498 16.286" xmlns="http://www.w3.org/2000/svg" className="svg four-star-svg">
            <path fill="#fc0" transform="translate(-0.001 -1.047)" d="M9.357,1.558,11.282,5.45a.919.919,0,0,0,.692.5l4.3.624a.916.916,0,0,1,.509,1.564l-3.115,3.029a.916.916,0,0,0-.264.812l.735,4.278a.919.919,0,0,1-1.334.967l-3.85-2.02a.922.922,0,0,0-.855,0l-3.85,2.02a.919.919,0,0,1-1.334-.967l.735-4.278a.916.916,0,0,0-.264-.812L.279,8.14A.916.916,0,0,1,.789,6.576l4.3-.624a.919.919,0,0,0,.692-.5L7.71,1.558A.92.92,0,0,1,9.357,1.558Z" />
            <path fill="#fc0" transform="translate(20.607 -1.047)" d="M9.357,1.558,11.282,5.45a.919.919,0,0,0,.692.5l4.3.624a.916.916,0,0,1,.509,1.564l-3.115,3.029a.916.916,0,0,0-.264.812l.735,4.278a.919.919,0,0,1-1.334.967l-3.85-2.02a.922.922,0,0,0-.855,0l-3.85,2.02a.919.919,0,0,1-1.334-.967l.735-4.278a.916.916,0,0,0-.264-.812L.279,8.14A.916.916,0,0,1,.789,6.576l4.3-.624a.919.919,0,0,0,.692-.5L7.71,1.558A.92.92,0,0,1,9.357,1.558Z" />
            <path fill="#fc0" transform="translate(41.215 -1.047)" d="M9.357,1.558,11.282,5.45a.919.919,0,0,0,.692.5l4.3.624a.916.916,0,0,1,.509,1.564l-3.115,3.029a.916.916,0,0,0-.264.812l.735,4.278a.919.919,0,0,1-1.334.967l-3.85-2.02a.922.922,0,0,0-.855,0l-3.85,2.02a.919.919,0,0,1-1.334-.967l.735-4.278a.916.916,0,0,0-.264-.812L.279,8.14A.916.916,0,0,1,.789,6.576l4.3-.624a.919.919,0,0,0,.692-.5L7.71,1.558A.92.92,0,0,1,9.357,1.558Z" />
            <path fill="#fc0" transform="translate(61.823 -1.047)" d="M9.357,1.558,11.282,5.45a.919.919,0,0,0,.692.5l4.3.624a.916.916,0,0,1,.509,1.564l-3.115,3.029a.916.916,0,0,0-.264.812l.735,4.278a.919.919,0,0,1-1.334.967l-3.85-2.02a.922.922,0,0,0-.855,0l-3.85,2.02a.919.919,0,0,1-1.334-.967l.735-4.278a.916.916,0,0,0-.264-.812L.279,8.14A.916.916,0,0,1,.789,6.576l4.3-.624a.919.919,0,0,0,.692-.5L7.71,1.558A.92.92,0,0,1,9.357,1.558Z" />
            <path fill="#e9e9e9" transform="translate(82.431 -1.047)" d="M9.357,1.558,11.282,5.45a.919.919,0,0,0,.692.5l4.3.624a.916.916,0,0,1,.509,1.564l-3.115,3.029a.916.916,0,0,0-.264.812l.735,4.278a.919.919,0,0,1-1.334.967l-3.85-2.02a.922.922,0,0,0-.855,0l-3.85,2.02a.919.919,0,0,1-1.334-.967l.735-4.278a.916.916,0,0,0-.264-.812L.279,8.14A.916.916,0,0,1,.789,6.576l4.3-.624a.919.919,0,0,0,.692-.5L7.71,1.558A.92.92,0,0,1,9.357,1.558Z" />
          </svg>
          ({questionCount * 250})
        </div>
      </div>
      
      <div className="button-container">
        <button className="buy-button button" onClick={() => onPlay(quiz.id)}>
          Play Now
        </button>
        <button className="cart-button button" onClick={() => onEdit?.(quiz.id)}>
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
          </svg>
        </button>
      </div>

      <style jsx>{`
        .card {
          --accent-color: #ffd426;
          position: relative;
          width: 240px;
          background: white;
          border-radius: 1rem;
          padding: 0.3rem;
          box-shadow: rgba(100, 100, 111, 0.2) 0px 50px 30px -20px;
          transition: all 0.5s ease-in-out;
        }

        .card .image-container {
          position: relative;
          width: 100%;
          height: 130px;
          border-radius: 0.7rem;
          border-top-right-radius: 4rem;
          margin-bottom: 1rem;
        }

        .card .image-container .svg {
          height: 100%;
          width: 100%;
          border-radius: inherit;
        }

        .card .image-container .difficulty-price {
          position: absolute;
          right: 0.7rem;
          bottom: -1rem;
          background: white;
          color: var(--accent-color);
          font-weight: 900;
          font-size: 0.9rem;
          padding: 0.5rem;
          border-radius: 1rem 1rem 2rem 2rem;
          box-shadow: rgba(100, 100, 111, 0.2) 0px 0px 15px 0px;
        }

        .card .favorite {
          position: absolute;
          width: 19px;
          height: 19px;
          top: 5px;
          right: 5px;
          cursor: pointer;
        }

        .card .favorite input {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .card .favorite input:checked ~ svg {
          animation: bouncing 0.5s;
          fill: rgb(255, 95, 95);
          filter: drop-shadow(0px 3px 1px rgba(53, 53, 53, 0.14));
        }

        .card .favorite svg {
          fill: #a8a8a8;
        }

        .card .content {
          padding: 0px 0.8rem;
          margin-bottom: 1rem;
        }

        .card .content .brand {
          font-weight: 900;
          color: #a6a6a6;
        }

        .card .content .product-name {
          font-weight: 700;
          color: #666666;
          font-size: 0.7rem;
          margin-bottom: 1rem;
        }

        .card .content .color-size-container {
          display: flex;
          justify-content: space-between;
          text-transform: uppercase;
          font-size: 0.7rem;
          font-weight: 700;
          color: #a8a8a8;
          gap: 2rem;
          margin-bottom: 1.5rem;
        }

        .card .content .color-size-container > * {
          flex: 1;
        }

        .card .content .color-size-container .colors .colors-container {
          list-style-type: none;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 0.3rem;
          font-size: 0.5rem;
          margin-top: 0.2rem;
        }

        .card .content .color-size-container .colors .colors-container .color {
          height: 14px;
          position: relative;
        }

        .card .content .color-size-container .colors .colors-container .color:hover .color-name {
          display: block;
        }

        .card .content .color-size-container .colors .colors-container .color .color-dot {
          display: inline-block;
          height: 100%;
          aspect-ratio: 1;
          border: 3px solid black;
          border-radius: 50%;
        }

        .card .content .color-size-container .colors .colors-container .color .color-name {
          display: none;
          position: absolute;
          bottom: 125%;
          left: 50%;
          transform: translateX(-50%);
          z-index: 99;
          background: black;
          color: white;
          padding: 0.2rem 1rem;
          border-radius: 1rem;
          text-align: center;
        }

        .card .content .color-size-container .colors .colors-container .active {
          border-color: black;
        }

        .card .content .color-size-container .sizes .size-container {
          list-style-type: none;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          margin-top: 0.2rem;
        }

        .card .content .color-size-container .sizes .size-container .size {
          height: 14px;
        }

        .card .content .color-size-container .sizes .size-container .size .size-radio {
          cursor: pointer;
        }

        .card .content .color-size-container .sizes .size-container .size .size-radio input {
          display: none;
        }

        .card .content .color-size-container .sizes .size-container .size .size-radio input:checked ~ .name {
          background: var(--accent-color);
          border-radius: 2rem 2rem 1.5rem 1.5rem;
          color: white;
        }

        .card .content .color-size-container .sizes .size-container .size .size-radio .name {
          display: grid;
          place-content: center;
          height: 100%;
          aspect-ratio: 1.2/1;
          text-decoration: none;
          color: #484848;
          font-size: 0.5rem;
          text-align: center;
        }

        .card .content .rating {
          color: #a8a8a8;
          font-size: 0.6rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .card .content .rating svg {
          height: 12px;
        }

        .card .button-container {
          display: flex;
          gap: 0.3rem;
        }

        .card .button-container .button {
          border-radius: 1.4rem 1.4rem 0.7rem 0.7rem;
          border: none;
          padding: 0.5rem 0;
          background: var(--accent-color);
          color: white;
          font-weight: 900;
          cursor: pointer;
        }

        .card .button-container .button:hover {
          background: orangered;
        }

        .card .button-container .buy-button {
          flex: auto;
        }

        .card .button-container .cart-button {
          display: grid;
          place-content: center;
          width: 50px;
        }

        .card .button-container .cart-button svg {
          width: 15px;
          fill: white;
        }

        .card:hover {
          transform: scale(1.03);
        }

        .question-float {
          animation: float 2s ease-in-out infinite;
        }

        .question-float-2 {
          animation: float 2s ease-in-out infinite 0.3s;
        }

        .question-float-3 {
          animation: float 2s ease-in-out infinite 0.6s;
        }

        @keyframes bouncing {
          from, to {
            transform: scale(1, 1);
          }
          25% {
            transform: scale(1.5, 2.1);
          }
          50% {
            transform: scale(2.1, 1.5);
          }
          75% {
            transform: scale(1.5, 2.05);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }
      `}</style>
    </div>
  )
}

export default QuizCard