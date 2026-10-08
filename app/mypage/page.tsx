import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { createClient } from '@/utils/supabase/server'
import AuthControls from './AuthControls'
import Link from 'next/link'

export default async function Mypage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolvedSearchParams = await searchParams
  const authError =
    typeof resolvedSearchParams.auth_error === 'string'
      ? resolvedSearchParams.auth_error
      : null

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

  const dashboardItems = [
    {
      title: 'お気に入りの楽譜',
      description: 'よく使う楽譜やあとで確認したい楽譜を保存できるようにします。',
      status: '開発中',
    },
    {
      title: '編曲楽譜の登録',
      description: '自分で編曲した楽譜を登録し、部内で共有できるようにします。',
      status: '開発中',
    },
    {
      title: '欲しい楽譜の投票',
      description: '購入してほしい楽譜や本をリクエスト・投票できるようにします。',
      status: '検討中',
    },
  ]

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
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Member Area</p>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">マイページ</h1>
            <p className="max-w-2xl text-muted-foreground text-sm leading-relaxed">
              お気に入りの楽譜、編曲楽譜、欲しい楽譜のリクエストを管理するためのページです。
            </p>
          </div>

          {authError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
              ログイン処理に失敗しました: {authError}
            </div>
          )}

          {user ? (
            <div className="space-y-8">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
                      {user.user_metadata?.avatar_url ? (
                        <img
                          src={user.user_metadata.avatar_url}
                          alt={displayName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-lg font-bold text-foreground">
                          {userInitial}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground">ログイン中</p>
                      <h2 className="truncate text-xl font-bold tracking-tight">{displayName}</h2>
                      <p className="truncate text-xs text-muted-foreground">{user.email ?? 'メールアドレス未設定'}</p>
                    </div>
                  </div>
                  <AuthControls user={user} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {dashboardItems.map((item) => (
                  <div
                    key={item.title}
                    className="flex min-h-44 flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm"
                  >
                    <div className="space-y-2">
                      <span className="inline-flex rounded-full bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">
                        {item.status}
                      </span>
                      <h3 className="text-lg font-bold tracking-tight">{item.title}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                    </div>
                    <p className="pt-4 text-xs text-muted-foreground">準備ができ次第、ここから使えるようになります。</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-xl font-bold tracking-tight">ログインが必要です</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                    マイページは音風メンバー向けの機能です。Keycloak アカウントでログインしてください。
                  </p>
                </div>
                <AuthControls user={null} />
              </div>
            </div>
          )}
        </section>
      </div>

      <Footer />
    </main>
  )
}
