"use client"
import React from 'react'
import ExtraForms from './ExtraForms'

export default function ExtraSearch() {
  return (
    <details className="group w-full max-w-2xl mx-auto rounded-xl border border-border bg-card shadow-sm open:shadow-md transition-all duration-300">
      <summary className="cursor-pointer list-none px-6 py-4 text-center text-sm font-semibold text-foreground hover:bg-muted/50 rounded-xl transition-colors select-none flex items-center justify-center gap-2">
         <span>⚙️ 詳細検索</span>
         <span className="group-open:rotate-180 transition-transform duration-300">▼</span>
      </summary>
      
      <div className="px-6 pb-6 pt-2 space-y-4 border-t border-border animate-in fade-in slide-in-from-top-2 duration-300">
        <p className="text-xs text-muted-foreground text-center leading-relaxed bg-muted/30 p-3 rounded-lg">
          ※ 開発中：完全一致・AND検索です。<br/>
          スペルに注意してください（英語/カタカナ等）。
        </p>
        
        <form action="/advancedsearch" method="get" className="flex flex-col items-center gap-4">
          <div className="w-full">
            <ExtraForms />
          </div>
          <button 
            type="submit" 
            className="w-full sm:w-auto py-2.5 px-8 text-sm font-medium text-primary-foreground bg-primary rounded-full hover:bg-primary/90 focus:ring-4 focus:ring-primary/20 transition-all shadow-sm hover:shadow"
          >
            検索する
          </button>
        </form>
      </div>
    </details>
  )
}
