import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateGamePin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function calculateScore(timeToAnswer: number, timeLimit: number, maxPoints: number): number {
  // Kahoot scoring: Base points + time bonus
  // Time bonus is proportional to how quickly the answer was given
  const timeBonus = Math.floor((timeLimit - timeToAnswer) / timeLimit * maxPoints * 0.5)
  return Math.max(0, maxPoints + timeBonus)
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function validateGamePin(pin: string): boolean {
  return /^\d{6}$/.test(pin)
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function getAnswerColor(index: number): string {
  const colors = ['red', 'blue', 'yellow', 'green']
  return colors[index % colors.length]
}

export function getAnswerSymbol(index: number): string {
  const symbols = ['▲', '♦', '●', '■']
  return symbols[index % symbols.length]
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}