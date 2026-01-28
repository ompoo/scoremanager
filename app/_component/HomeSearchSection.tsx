"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryStates, createSerializer, debounce } from 'nuqs'
import { searchParamsParsers } from '@/lib/searchParams'

export default function HomeSearchSection() {
  const router = useRouter()
  const [isAdvanced, setIsAdvanced] = useState(false)
  
  // URLパラメータを一元管理
  const [params, setParams] = useQueryStates(searchParamsParsers, {
    limitUrlUpdates: debounce(250),
    shallow: true
  })

  const serialize = createSerializer(searchParamsParsers)


  // --- Handlers ---


  
  const clearAll = () => {
    setParams(null)
  }

  const handleSearch = () => {
    router.push('/advancedsearch' + serialize(params));
  }

  
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParams({ query: e.target.value })
  }

  const handleQueryClear = () => {
    setParams({ query: null })
  }

  const executeSearch = () => {
    router.push('/search' + serialize(params))
  }


  const toggleMode = () => {
    // モード切替時にリセットする
    setParams(null)
    setIsAdvanced(!isAdvanced)
  }

  // --- UI Parts ---

  const sections = [
    {
      title: "🎵 基本情報",
      fields: [
        { id: 'song_name', label: '曲名 (Song Name)', name: 'song' as const, placeholder: '例: 宝島' },
        { id: 'book', label: '収録本 (Book Name)', name: 'book' as const, placeholder: '例: J-POP Vol.1' },
      ]
    },
    {
      title: "👤 アーティスト・制作",
      fields: [
        { id: 'artist', label: 'アーティスト (Artist)', name: 'artist' as const, placeholder: '例: T-SQUARE' },
        { id: 'song_writer', label: '作曲者 (Composer)', name: 'songWriter' as const, placeholder: '' },
        { id: 'lyricist', label: '作詞者 (Lyricist)', name: 'lyricist' as const, placeholder: '' },
        { id: 'arranger', label: '編曲者 (Arranger)', name: 'arranger' as const, placeholder: '' },
      ]
    },
    {
      title: "📝 その他",
      fields: [
        { id: 'sgrade', label: 'グレード (Grade)', name: 'grade' as const, placeholder: '例: 5級' },
        { id: 'memo', label: 'メモ (Memo)', name: 'memo' as const, placeholder: 'キーワードなど' },
      ]
    }
  ] as const

  return (
    <div className="w-full space-y-6">
      <div className="w-full transition-all duration-300">
        {isAdvanced ? (
          /* Advanced Search Forms */
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 shadow-sm animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-center font-semibold text-muted-foreground mb-4">詳細検索モード</h3>
              {sections.map((section) => (
                <div key={section.title} className="space-y-3">
                  <h3 className="text-sm font-bold text-muted-foreground flex items-center gap-2 border-b border-border pb-2">
                    {section.title}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {section.fields.map((field) => (
                      <div key={field.id} className="space-y-1.5 group">
                        <label 
                          htmlFor={field.id} 
                          className="text-xs font-semibold text-foreground/80 group-focus-within:text-primary transition-colors ml-1"
                        >
                          {field.label}
                        </label>
                        <input
                          id={field.id}
                          name={field.name}
                          value={params[field.name] || ''}
                          onChange={(e) => setParams({ [field.name]: e.target.value })}
                          placeholder={field.placeholder}
                          className="w-full rounded-lg border border-input bg-background/50 px-3 py-2.5 text-sm shadow-sm transition-all placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary hover:border-primary/50"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-sm text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 px-3 py-2 rounded-md hover:bg-muted order-2 sm:order-1"
                >
                  <span>✕</span> すべてクリア
                </button>
                
                <button 
                  type="button"
                  onClick={handleSearch}
                  className="w-full sm:w-auto order-1 sm:order-2 py-3 px-8 text-sm font-bold tracking-wide text-primary-foreground bg-primary rounded-full hover:bg-primary/90 focus:ring-4 focus:ring-primary/20 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                >
                  検索結果を表示
                </button>
              </div>
            </div>
        ) : (
          /* Simple Search Bar */
          <div className="animate-in fade-in zoom-in-95 duration-200">
             <div className="max-w-xl mx-auto relative group">
              <div className="absolute inset-0 bg-linear-to-r from-primary/20 via-primary/10 to-transparent rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  id="query"
                  name="query"
                  placeholder="曲名、本、アーティスト..." 
                  value={params.query || ''}
                  onChange={handleQueryChange}
                  className="w-full rounded-full bg-card border border-input text-foreground placeholder:text-muted-foreground py-3.5 pl-6 pr-24 text-base shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 hover:border-primary/50" 
                />
                
                <div className="absolute right-2 flex items-center gap-1">
                  {params.query && (
                    <button 
                      onClick={handleQueryClear}
                      className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      aria-label="Clear search"
                      type="button"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                  
                  <button 
                    onClick={executeSearch}
                    className="p-2.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm active:scale-95 cursor-pointer" 
                    aria-label="Search"
                    type="button"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <button
          onClick={toggleMode}
          className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 px-4 py-2 rounded-full hover:bg-muted/50"
        >
          {isAdvanced ? (
            <>
              <span>🔍 シンプルな検索に戻る</span>
            </>
          ) : (
            <>
              <span>⚙️ 詳細条件で検索する</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
