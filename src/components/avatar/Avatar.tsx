'use client'

import Image from 'next/image'
import { avatarOptions } from './AvatarSelector'

interface AvatarProps {
  avatarId?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showBorder?: boolean
}

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12', 
  lg: 'w-16 h-16',
  xl: 'w-24 h-24'
}

export default function Avatar({ 
  avatarId = 'boy', 
  size = 'md', 
  className = '', 
  showBorder = true 
}: AvatarProps) {
  // Map special avatar IDs to actual ones
  const idMap: Record<string, string> = {
    'teacher': 'employee',
    'student': 'chinese',
    'admin': 'superhero'
  }
  
  const mappedId = idMap[avatarId] || avatarId
  const avatar = avatarOptions.find(a => a.id === mappedId) || avatarOptions[0]
  
  return (
    <div className={`
      ${sizeMap[size]} 
      ${showBorder ? 'ring-2 ring-white shadow-lg' : ''} 
      rounded-full overflow-hidden relative
      ${className}
    `}>
      <Image
        src={avatar.image}
        alt={avatar.name}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 64px, 96px"
      />
    </div>
  )
}