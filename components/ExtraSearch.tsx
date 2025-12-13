"use client"
import React from 'react'
import ExtraForms from './ExtraForms'
import { useQueryStates } from 'nuqs'
import { searchParamsParsers } from '@/lib/searchParams'

export default function ExtraSearch() {
  const [state] = useQueryStates(searchParamsParsers)

  // Check if any advanced field has a value
  const hasActiveFilters = [
    state.book, state.song, state.artist, state.lyricist, 
    state.songWriter, state.arranger, state.grade, state.memo
  ].some(val => !!val)

  return (
    <details className="group w-full max-w-3xl mx-auto rounded-xl border border-border bg-card/50 backdrop-blur-sm shadow-sm open:shadow-lg open:bg-card transition-all duration-300">
      <summary className="cursor-pointer list-none px-6 py-4 text-center text-sm font-semibold text-foreground hover:bg-muted/50 rounded-xl transition-colors select-none flex items-center justify-center gap-2 relative">
         <span className="flex items-center gap-2">
            <span>⚙️ 詳細検索</span>
            {hasActiveFilters && (
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" aria-label="Filters active" />
            )}
         </span>
         <span className="group-open:rotate-180 transition-transform duration-300 text-muted-foreground">▼</span>
      </summary>
      
      <div className="px-6 pb-8 pt-2 space-y-6 border-t border-border animate-in fade-in slide-in-from-top-1 duration-200 cursor-default">
        <div className="bg-primary/5 rounded-lg p-3 text-xs text-muted-foreground text-center border border-primary/10">
          <p>複数の条件を組み合わせて検索できます（AND検索）</p>
        </div>
        
        <form action="/advancedsearch" method="get" className="flex flex-col gap-8">
          <div className="w-full">
            <ExtraForms />
          </div>
          
          <div className="flex justify-center">
            <button 
              type="submit" 
              className="w-full sm:w-auto min-w-50 py-3 px-8 text-sm font-bold tracking-wide text-primary-foreground bg-primary rounded-full hover:bg-primary/90 focus:ring-4 focus:ring-primary/20 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            >
              検索結果を表示
            </button>
          </div>
        </form>
      </div>
    </details>
  )
}
