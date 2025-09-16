'use client'

import { useState } from 'react'
import Image from 'next/image'

// Define avatar data based on the files in the avatar folder
export const avatarOptions = [
  { id: 'boy', image: '/avatars/001-boy.png', name: 'Boy' },
  { id: 'otaku', image: '/avatars/001-otaku.png', name: 'Otaku' },
  { id: 'employee', image: '/avatars/002-employee.png', name: 'Employee' },
  { id: 'geek', image: '/avatars/002-geek.png', name: 'Geek' },
  { id: 'boy1', image: '/avatars/003-boy-1.png', name: 'Cool Boy' },
  { id: 'otaku1', image: '/avatars/003-otaku-1.png', name: 'Cool Otaku' },
  { id: 'boy2', image: '/avatars/004-boy.png', name: 'Smart Boy' },
  { id: 'woman', image: '/avatars/004-woman.png', name: 'Woman' },
  { id: 'chess', image: '/avatars/005-chess-player.png', name: 'Chess Player' },
  { id: 'cosplayer', image: '/avatars/005-cosplayer.png', name: 'Cosplayer' },
  { id: 'cosplayer1', image: '/avatars/006-cosplayer-1.png', name: 'Cool Cosplayer' },
  { id: 'superhero', image: '/avatars/007-superhero.png', name: 'Superhero' },
  { id: 'girl', image: '/avatars/008-girl.png', name: 'Girl' },
  { id: 'chinese', image: '/avatars/009-chinese.png', name: 'Student' },
  { id: 'nerd', image: '/avatars/010-nerd.png', name: 'Nerd' }
]

interface AvatarSelectorProps {
  selectedAvatar: any
  onAvatarSelect: (avatar: any) => void
  className?: string
}

export default function AvatarSelector({ selectedAvatar, onAvatarSelect, className = '' }: AvatarSelectorProps) {
  return (
    <div className={`grid grid-cols-3 gap-3 ${className}`}>
      {avatarOptions.map((avatar) => (
        <button
          key={avatar.id}
          onClick={() => onAvatarSelect(avatar)}
          className={`relative w-full aspect-square rounded-xl overflow-hidden transition-all duration-300 ${
            selectedAvatar?.id === avatar.id 
              ? 'ring-4 ring-kahoot-purple scale-105 shadow-lg' 
              : 'ring-2 ring-gray-200 hover:ring-kahoot-purple/50 hover:scale-102'
          }`}
        >
          <Image
            src={avatar.image}
            alt={avatar.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100px, 120px"
          />
          {selectedAvatar?.id === avatar.id && (
            <div className="absolute inset-0 bg-kahoot-purple/20 flex items-center justify-center">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-kahoot-purple" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          )}
        </button>
      ))}
    </div>
  )
}