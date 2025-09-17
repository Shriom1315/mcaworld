import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BitWise - Make Learning Awesome!',
  description: 'Create and play fun learning games with BitWise',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-kahoot-purple via-kahoot-blue to-kahoot-pink">
          {children}
        </div>
      </body>
    </html>
  )
}