import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore'
import { COLLECTIONS } from '@/types/firebase'

// Generate a unique 6-digit PIN
function generateGamePin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  try {
    const { quizId, hostId } = await request.json()

    if (!quizId || !hostId) {
      return NextResponse.json(
        { success: false, error: 'Quiz ID and Host ID are required' },
        { status: 400 }
      )
    }

    // Generate a unique PIN
    let pin: string
    let pinExists = true
    let attempts = 0
    const maxAttempts = 10

    do {
      pin = generateGamePin()
      const gamesRef = collection(db, COLLECTIONS.GAMES)
      const pinQuery = query(gamesRef, where('pin', '==', pin))
      const existingPins = await getDocs(pinQuery)
      pinExists = !existingPins.empty
      attempts++
    } while (pinExists && attempts < maxAttempts)

    if (pinExists) {
      return NextResponse.json(
        { success: false, error: 'Failed to generate unique PIN. Please try again.' },
        { status: 500 }
      )
    }

    const now = Timestamp.now()
    const gameData = {
      pin,
      quiz_id: quizId,
      host_id: hostId,
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

    const gamesRef = collection(db, COLLECTIONS.GAMES)
    const docRef = await addDoc(gamesRef, gameData)

    const game = {
      id: docRef.id,
      ...gameData
    }

    return NextResponse.json({
      success: true,
      data: game,
      message: 'Game created successfully'
    })

  } catch (error) {
    console.error('Game creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}