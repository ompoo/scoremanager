import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Notice from './_component/Notice'
import Pickups from './_component/Pickups'
import SearchBar from '@/components/SearchBar'
import ExtraSearch from '@/components/ExtraSearch'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-background text-foreground">
      <Header small />

      <div className="flex-1 w-full max-w-5xl mx-auto px-4 py-16 sm:py-24 space-y-20">
        
        {/* Hero / Unified Search Section */}
        <section className="flex flex-col items-center space-y-8 max-w-3xl mx-auto w-full">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-linear-to-br from-foreground to-muted-foreground pb-2">
              音風 楽譜館
            </h2>
            <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
              部室にある全ての楽譜・書籍を一括検索
            </p>
          </div>

          <div className="w-full space-y-6">
            <form method="get" action="/search" className="w-full transform transition-all hover:scale-[1.01] duration-300">
              <SearchBar autoSync={false} />
            </form>
            
            <div className="flex justify-center w-full">
              <ExtraSearch />
            </div>
          </div>
        </section>

        {/* Information Sections */}
        <div className="grid gap-12 pt-8 border-t border-border/50">
        <section className="space-y-6">
          <Notice />
        </section>
          
          <section className="space-y-6">
          <Pickups />
          </section>
        </div>
      </div>

      <Footer />
    </main>
  )
}
