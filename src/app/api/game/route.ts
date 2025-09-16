import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, query, where, Timestamp } from 'firebase/firestore'
import { COLLECTIONS } from '@/types/supabase'

export async function POST(request: NextRequest) {
  try {
    const { pin } = await request.json()

    if (!pin || !/^\d{6}$/.test(pin)) {
      return NextResponse.json(
        { success: false, error: 'Invalid PIN format' },
        { status: 400 }
      )
    }

    const gamesRef = collection(db, COLLECTIONS.GAMES)
    const gameQuery = query(gamesRef, where('pin', '==', pin))
    const querySnapshot = await getDocs(gameQuery)
    
    if (querySnapshot.empty) {
      return NextResponse.json(
        { success: false, error: 'Game not found' },
        { status: 404 }
      )
    }

    const gameDoc = querySnapshot.docs[0]
    const gameData = gameDoc.data()
    const game = { id: gameDoc.id, ...gameData } as any

    if (game.status !== 'waiting') {
      return NextResponse.json(
        { success: false, error: 'Game has already started' },
        { status: 400 }
      )
    }

    // Get quiz details
    const quizDoc = await getDoc(doc(db, COLLECTIONS.QUIZZES, game.quiz_id))
    const quiz = quizDoc.exists() ? quizDoc.data() : null

    return NextResponse.json({
      success: true,
      data: {
        gameId: game.id,
        pin: game.pin,
        status: game.status,
        playerCount: Array.isArray(game.players) ? game.players.length : 0,
        quizTitle: quiz?.title
      }
    })

  } catch (error) {
    console.error('Game verification error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { pin, nickname } = await request.json()

    if (!pin || !nickname) {
      return NextResponse.json(
        { success: false, error: 'PIN and nickname are required' },
        { status: 400 }
      )
    }

    // Get the current game
    const gamesRef = collection(db, COLLECTIONS.GAMES)
    const gameQuery = query(gamesRef, where('pin', '==', pin))
    const querySnapshot = await getDocs(gameQuery)
    
    if (querySnapshot.empty) {
      return NextResponse.json(
        { success: false, error: 'Game not found' },
        { status: 404 }
      )
    }

    const gameDoc = querySnapshot.docs[0]
    const gameData = gameDoc.data()
    const game = { id: gameDoc.id, ...gameData } as any

    // Check if nickname is already taken
    const players = Array.isArray(game.players) ? game.players : []
    const existingPlayer = players.find((p: any) => p.nickname === nickname)
    if (existingPlayer) {
      return NextResponse.json(
        { success: false, error: 'Nickname already taken' },
        { status: 400 }
      )
    }

    // Generate a unique player ID
    const playerId = crypto.randomUUID()

    // Add player to game
    const newPlayer = {
      id: playerId,
      nickname,
      score: 0,
      answers: [],
      joinedAt: new Date().toISOString(),
      isActive: true
    }

    const updatedPlayers = [...players, newPlayer]

    // Update the game with new player
    const gameDocRef = doc(db, COLLECTIONS.GAMES, game.id)
    await updateDoc(gameDocRef, { players: updatedPlayers })

    // Create a game session record
    const gameSessionsRef = collection(db, COLLECTIONS.GAME_SESSIONS)
    await addDoc(gameSessionsRef, {
      game_id: game.id,
      player_id: playerId,
      nickname,
      score: 0,
      answers: [],
      created_at: Timestamp.now()
    })

    return NextResponse.json({
      success: true,
      data: {
        playerId,
        gameId: game.id,
        pin: game.pin
      },
      message: 'Successfully joined game'
    })

  } catch (error) {
    console.error('Join game error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}