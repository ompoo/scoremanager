"use client"
import { debounce, useQueryStates } from 'nuqs'
import { searchParamsParsers, createUrlWithParams } from '@/lib/searchParams'
import { useRouter } from 'next/navigation'

export default function ExtraForms() {
  const router = useRouter()
  
  const [state, setState] = useQueryStates(searchParamsParsers, {
    limitUrlUpdates:debounce(250),
    shallow: true
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
      query: null, // Clear global query as well, as requested. Advanced forms usually clear all fields.
    })
  }

  const handleSearch = () => {
    router.push(createUrlWithParams('/advancedsearch', state));
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
                  value={state[field.name] || undefined}
                  onChange={(e) => setState({ [field.name]: e.target.value })}
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
  )
}
