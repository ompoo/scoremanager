import Link from 'next/link'
import React from 'react'
import { createClient } from '@/utils/supabase/server'
import UserMenu from './UserMenu'

type Props = {
  small?: boolean
  showAccountLink?: boolean
  variant?: 'app' | 'home'
}

export default async function Header({ small, showAccountLink = true, variant = 'app' }: Props) {
  const containerClass = small ? 'h-[25vh] min-h-[160px] sm:max-h-[250px]' : 'h-20'
  const showDecorativeBackground = variant === 'home'

  // Fetch logged in user server-side
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  return (
    <div className={`relative w-full ${containerClass} overflow-hidden border-b border-border/40 bg-background/80 backdrop-blur-md transition-all duration-500`}>
      {/* Decorative Background Elements */}
      {showDecorativeBackground && (
        <div className="absolute inset-0 z-0 opacity-20 dark:opacity-10 pointer-events-none">
           <img src="/back_left.jpg" alt="" className="absolute top-0 left-0 h-full object-cover w-1/3 mask-image-linear-to-r" style={{ maskImage: 'linear-gradient(to right, black, transparent)' }} />
           <img src="/back_right.jpg" alt="" className="absolute top-0 right-0 h-full object-cover w-1/3" style={{ maskImage: 'linear-gradient(to left, black, transparent)' }} />
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 h-full w-full max-w-7xl mx-auto flex items-center justify-between px-6">
        <Link href="/" className="group flex min-w-0 items-center gap-4 transition-opacity hover:opacity-80">
          <div className="relative h-12 w-12 overflow-hidden rounded-full shadow-lg ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all">
             <img className="h-full w-full object-cover" src="/logo.jpg" alt="logo" />
          </div>
          <div className="flex min-w-0 flex-col">
             <h1 className="truncate text-xl sm:text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
               TUAT electone
             </h1>
             <span className="truncate text-sm font-medium text-muted-foreground tracking-widest">
               音風
             </span>
          </div>
        </Link>
        
        {showAccountLink && (
          <nav className="ml-1 flex items-center" aria-label="ユーザーメニュー">
            {user ? (
              <UserMenu user={user} />
            ) : (
              <Link
                href="/mypage"
                className="inline-flex h-9 items-center justify-center rounded-full border border-border bg-background/80 px-4 text-xs font-semibold text-foreground shadow-xs backdrop-blur-xs transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                ログイン
              </Link>
            )}
          </nav>
        )}
      </div>
    </div>
  )
}
