import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, addDoc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore'
import { COLLECTIONS } from '@/types/firebase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    const quizzesRef = collection(db, COLLECTIONS.QUIZZES)
    let quizzesQuery

    if (userId) {
      quizzesQuery = query(
        quizzesRef,
        where('creator_id', '==', userId),
        orderBy('updated_at', 'desc')
      )
    } else {
      quizzesQuery = query(
        quizzesRef,
        where('is_published', '==', true),
        orderBy('updated_at', 'desc')
      )
    }

    const querySnapshot = await getDocs(quizzesQuery)
    const quizzes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return NextResponse.json({
      success: true,
      data: quizzes
    })

  } catch (error) {
    console.error('Quiz API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, questions, settings, creatorId } = await request.json()

    if (!title || !questions || questions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Title and at least one question are required' },
        { status: 400 }
      )
    }

    if (!creatorId) {
      return NextResponse.json(
        { success: false, error: 'Creator ID is required' },
        { status: 400 }
      )
    }

    const now = Timestamp.now()
    const quizData = {
      title,
      description: description || '',
      creator_id: creatorId,
      questions,
      settings: settings || {
        shuffleQuestions: false,
        shuffleAnswers: false,
        showAnswers: true,
        showCorrectAnswers: true,
        allowAnswerChange: false
      },
      is_published: false,
      created_at: now,
      updated_at: now
    }

    const quizzesRef = collection(db, COLLECTIONS.QUIZZES)
    const docRef = await addDoc(quizzesRef, quizData)

    const quiz = {
      id: docRef.id,
      ...quizData
    }

    return NextResponse.json({
      success: true,
      data: quiz,
      message: 'Quiz created successfully'
    })

  } catch (error) {
    console.error('Quiz creation API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}