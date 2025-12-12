import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Notice from './_component/Notice'
import Pickups from '@/components/Pickups'
import SearchBar from '@/components/SearchBar'
import ExtraSearch from '@/components/ExtraSearch'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-background text-foreground">
      <Header small />

      <div className="flex-1 w-full max-w-5xl mx-auto px-4 py-12 space-y-16">
        
        {/* Hero / Intro Section */}
        <section className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
            音風 楽譜館へようこそ
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            ここでは部室所蔵の楽譜を検索できます。
          </p>
        </section>

        {/* Search Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Book Search */}
          <div className="group rounded-2xl border border-border bg-card p-8 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300">
            <h3 className="text-xl font-bold mb-6 flex items-center justify-center gap-2 text-foreground">
              <span>📚</span> <span>本の検索</span>
            </h3>
            <form method="get" action="/searchbook" className="w-full">
              <SearchBar />
            </form>
          </div>

          {/* Song Search */}
          <div className="group rounded-2xl border border-border bg-card p-8 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300">
            <h3 className="text-xl font-bold mb-6 flex items-center justify-center gap-2 text-foreground">
              <span>🎵</span> <span>曲の検索</span>
            </h3>
            <form method="get" action="/searchsong" className="w-full">
              <SearchBar />
            </form>
          </div>
        </div>

        {/* Advanced Search */}
        <div className="flex justify-center">
          <ExtraSearch />
        </div>

        {/* Information Sections */}
        <div className="grid gap-12">
          <section className="space-y-6">
            <h3 className="text-2xl font-bold text-center tracking-tight">お知らせ</h3>
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <Notice noticeData={[]} />
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-2xl font-bold text-center tracking-tight">Pick Up</h3>
            <Pickups items={[]} />
          </section>
        </div>
      </div>

      <Footer />
    </main>
  )
}
