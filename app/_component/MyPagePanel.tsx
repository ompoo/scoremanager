import React from 'react'
import Link from 'next/link'

export default function MyPagePanel() {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">👤</span>
        <h3 className="text-2xl font-bold tracking-tight">マイページ</h3>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-2">
        <p className="text-sm text-muted-foreground">開発中です。</p>
        <Link
          href="/mypage"
          className="text-sm font-medium text-foreground underline-offset-4 transition-colors hover:text-muted-foreground hover:underline"
        >
          マイページはこちら
        </Link>
      </div>
    </div>
  )
}
