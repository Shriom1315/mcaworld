'use client'

import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'

type UserProfile = Database['public']['Tables']['users']['Row']

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        setUserProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
      } else {
        setUserProfile(data)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signUp = async (email: string, password: string, username: string, role: 'teacher' | 'student') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          role
        }
      }
    })

    if (data.user && !error) {
      // Create profile in users table
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email,
          username,
          role
        })

      if (profileError) {
        console.error('Error creating user profile:', profileError)
        return { data, error: profileError }
      }
    }

    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return {
    user,
    userProfile,
    session,
    loading,
    signIn,
    signUp,
    signOut
  }
}

// Hook for real-time game updates
export function useGameRealtime(gameId: string | null) {
  const [gameData, setGameData] = useState<any>(null)
  const [players, setPlayers] = useState<any[]>([])

  useEffect(() => {
    if (!gameId) return

    // Subscribe to game changes
    const gameSubscription = supabase
      .channel(`game-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`
        },
        (payload) => {
          setGameData(payload.new)
          if (payload.new?.players) {
            setPlayers(payload.new.players)
          }
        }
      )
      .subscribe()

    // Subscribe to game session changes (players joining/leaving)
    const sessionSubscription = supabase
      .channel(`game-sessions-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_sessions',
          filter: `game_id=eq.${gameId}`
        },
        (payload) => {
          // Refresh game data when sessions change
          fetchGameData()
        }
      )
      .subscribe()

    // Initial fetch
    fetchGameData()

    const fetchGameData = async () => {
      const { data: game } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single()

      if (game) {
        setGameData(game)
        if (game.players) {
          setPlayers(game.players)
        }
      }
    }

    return () => {
      gameSubscription.unsubscribe()
      sessionSubscription.unsubscribe()
    }
  }, [gameId])

  const updateGameStatus = async (status: string) => {
    if (!gameId) return

    const { error } = await supabase
      .from('games')
      .update({ status })
      .eq('id', gameId)

    return { error }
  }

  const updateCurrentQuestion = async (questionIndex: number) => {
    if (!gameId) return

    const { error } = await supabase
      .from('games')
      .update({ current_question_index: questionIndex })
      .eq('id', gameId)

    return { error }
  }

  return {
    gameData,
    players,
    updateGameStatus,
    updateCurrentQuestion
  }
}