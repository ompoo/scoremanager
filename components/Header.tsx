"use client"
import Link from 'next/link'
import React from 'react'

type Props = {
  small?: boolean
}

export default function Header({ small }: Props) {
  const containerClass = small ? 'h-[25vh] min-h-[160px] sm:max-h-[250px]' : 'h-20'
  
  return (
    <div className={`relative w-full ${containerClass} overflow-hidden border-b border-border/40 bg-background/80 backdrop-blur-md transition-all duration-500`}>
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 z-0 opacity-20 dark:opacity-10 pointer-events-none">
         <img src="/back_left.jpg" alt="" className="absolute top-0 left-0 h-full object-cover w-1/3 mask-image-linear-to-r" style={{ maskImage: 'linear-gradient(to right, black, transparent)' }} />
         <img src="/back_right.jpg" alt="" className="absolute top-0 right-0 h-full object-cover w-1/3" style={{ maskImage: 'linear-gradient(to left, black, transparent)' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-full w-full max-w-7xl mx-auto flex items-center justify-between px-6">
        <Link href="/" className="group flex items-center gap-4 transition-opacity hover:opacity-80">
          <div className="relative h-12 w-12 overflow-hidden rounded-full shadow-lg ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all">
             <img className="h-full w-full object-cover" src="/logo.jpg" alt="logo" />
          </div>
          <div className="flex flex-col">
             <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
               TUAT electone
             </h1>
             <span className="text-sm font-medium text-muted-foreground tracking-widest">
               音風
             </span>
          </div>
        </Link>
        
        {/* Optional: Add navigation links here if needed in future */}
      </div>
    </div>
  )
}
