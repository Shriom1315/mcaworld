'use client'

import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'
import Link from 'next/link'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  asChild?: boolean
  href?: string
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild = false, href, children, ...props }, ref) => {
    const buttonClasses = cn(
      'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
      {
        'bg-kahoot-purple text-white hover:bg-kahoot-purple/90 focus:ring-kahoot-purple': variant === 'primary',
        'bg-white text-kahoot-purple border-2 border-kahoot-purple hover:bg-gray-50 focus:ring-kahoot-purple': variant === 'secondary',
        'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500': variant === 'outline',
        'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500': variant === 'ghost',
        'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500': variant === 'destructive',
      },
      {
        'h-8 px-3 text-sm': size === 'sm',
        'h-10 px-4 text-base': size === 'md',
        'h-12 px-6 text-lg': size === 'lg',
      },
      className
    )

    if (asChild && href) {
      return (
        <Link href={href} className={buttonClasses}>
          {children}
        </Link>
      )
    }

    if (asChild) {
      return <div className={buttonClasses}>{children}</div>
    }

    return (
      <button
        className={buttonClasses}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button }