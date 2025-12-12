"use client"
import React from 'react'
import { useQueryStates } from 'nuqs'
import { searchParamsParsers } from '@/lib/searchParams'

export default function ExtraForms() {
  const [state, setState] = useQueryStates(searchParamsParsers, {
    throttleMs: 500,
    shallow: false
  })

  const clearAll = () => {
    setState({
      book: null,
      song: null,
      artist: null,
      lyricist: null,
      songWriter: null,
      arranger: null,
      grade: null,
      memo: null,
      query: state.query // Keep global query? Or clear it too? Usually advanced form clears its own fields. Let's keep query.
    })
  }
  
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
  ]

  return (
    <div className="w-full space-y-8 p-1">
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
                  value={state[field.name] || ''}
                  onChange={(e) => setState({ [field.name]: e.target.value })}
                  placeholder={field.placeholder}
                  className="w-full rounded-lg border border-input bg-background/50 px-3 py-2.5 text-sm shadow-sm transition-all placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary hover:border-primary/50"
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-end pt-4 border-t border-border">
        <button
          type="button"
          onClick={clearAll}
          className="text-sm text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 px-3 py-2 rounded-md hover:bg-muted"
        >
          <span>✕</span> すべてクリア
        </button>
      </div>
    </div>
  )
}
