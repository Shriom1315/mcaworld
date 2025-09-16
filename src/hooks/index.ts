'use client'

import { useState, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
import { SocketEvents } from '@/types'

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001')

    socketInstance.on('connect', () => {
      setIsConnected(true)
    })

    socketInstance.on('disconnect', () => {
      setIsConnected(false)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  return { socket, isConnected }
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue] as const
}

export function useTimer(initialTime: number) {
  const [time, setTime] = useState(initialTime)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime(time => time - 1)
      }, 1000)
    } else if (time === 0) {
      setIsRunning(false)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, time])

  const start = () => setIsRunning(true)
  const stop = () => setIsRunning(false)
  const reset = (newTime?: number) => {
    setTime(newTime ?? initialTime)
    setIsRunning(false)
  }

  return { time, isRunning, start, stop, reset }
}