"use client"

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'

type Props = {
  user: User
}

export default function UserMenu({ user }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const displayName =
    user.user_metadata?.name ??
    user.user_metadata?.preferred_username ??
    user.email?.split('@')[0] ??
    'ユーザー'

  const initial = displayName.charAt(0).toUpperCase()

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  async function handleSignOut() {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Sign out error:', error.message)
      setLoading(false)
      return
    }

    setIsOpen(false)
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-sm font-bold text-foreground transition-all hover:ring-2 hover:ring-primary/30 focus-visible:outline-hidden"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="ユーザーメニューを開く"
      >
        {user.user_metadata?.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            alt={displayName}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/30 text-primary">
            {initial}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-border bg-card p-2 text-card-foreground shadow-lg ring-1 ring-black/5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3 py-2 text-xs border-b border-border/60 mb-1">
            <p className="font-semibold text-foreground truncate">{displayName}</p>
            <p className="text-muted-foreground truncate">{user.email}</p>
          </div>
          <div className="space-y-0.5">
            <Link
              href="/mypage"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-muted-foreground">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
              <span>マイページ</span>
            </Link>
            <button
              onClick={handleSignOut}
              disabled={loading}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50 text-left"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-red-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
              </svg>
              <span>{loading ? 'ログアウト中...' : 'ログアウト'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
