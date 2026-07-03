import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { createClient } from '@/utils/supabase/server'
import AuthControls from './AuthControls'
import Link from 'next/link'

export default async function Mypage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const displayName =
    user?.user_metadata?.name ??
    user?.user_metadata?.preferred_username ??
    user?.email?.split('@')[0] ??
    'ログイン中のユーザー'

  const userInitial = displayName.charAt(0).toUpperCase()
  
  const lastLogin = user?.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleString('ja-JP', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : null

  return (
    <main className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Navigation back to search */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
              stroke="currentColor"
              className="w-4 h-4 transition-transform group-hover:-translate-x-1"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            <span>楽譜検索に戻る</span>
          </Link>
        </div>

        <section className="space-y-8">
          <div className="space-y-2 border-b border-border/50 pb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Account Management</p>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">マイページ</h1>
            <p className="max-w-2xl text-muted-foreground text-sm leading-relaxed">
              音風メンバー用のアカウント管理画面です。ログイン状態の確認やログアウトを行えます。
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/50 backdrop-blur-xs shadow-xs">
            {user ? (
              <div className="p-6 sm:p-8 space-y-8">
                {/* Profile Header */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-5 border-b border-border/40 pb-6">
                  <div className="h-16 w-16 shrink-0 rounded-full border border-border bg-muted flex items-center justify-center font-bold text-xl text-primary shadow-xs">
                    {user.user_metadata?.avatar_url ? (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt={displayName}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/30 text-primary">
                        {userInitial}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
                      認証済みメンバー
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{displayName}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">ID: {user.id}</p>
                  </div>
                </div>

                {/* Account Details */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-border/60 bg-muted/10 p-5">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">メールアドレス</span>
                    <span className="text-sm font-medium break-all text-foreground">{user.email ?? '未設定'}</span>
                  </div>
                  {lastLogin && (
                    <div className="rounded-xl border border-border/60 bg-muted/10 p-5">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">最終ログイン時刻</span>
                      <span className="text-sm font-medium text-foreground">{lastLogin}</span>
                    </div>
                  )}
                </div>

                {/* Auth Controls */}
                <div className="pt-4 border-t border-border/40 flex items-center justify-between gap-4 flex-wrap">
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                    セッションを終了する場合は、ログアウトボタンを押してください。ブラウザの認証キャッシュがクリアされます。
                  </p>
                  <AuthControls user={user} />
                </div>
              </div>
            ) : (
              <div className="p-6 sm:p-8 space-y-6">
                <div className="space-y-3">
                  <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">ログインが必要です</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                    この機能は部員専用です。お気に入りの登録、編曲楽譜の登録と管理などを利用するには、Keycloakアカウントでログインしてください。
                  </p>
                </div>
                
                <div className="pt-4 border-t border-border/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <p className="text-xs text-muted-foreground">
                    ログインに関して問題がある場合は、システム管理者までお問い合わせください。
                  </p>
                  <AuthControls user={null} />
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <Footer />
    </main>
  )
}

