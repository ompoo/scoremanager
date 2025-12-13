"use client"
import { debounce, useQueryState } from 'nuqs'
import { searchParamsParsers } from '@/lib/searchParams'

type Props = {
  autoSync?: boolean
}

export default function SearchBar({ autoSync = true }: Props) {

    const [urlQuery, setUrlQuery] = useQueryState('query', searchParamsParsers.query.withOptions({
      shallow: !autoSync,
      limitUrlUpdates:debounce(250),
    }))
    
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
      setUrlQuery(
        val
      )
  }

  const handleClear = () => {
    setUrlQuery('')
  }

  // Use localQuery for display to ensure responsiveness, 
  // though if autoSync is true, urlQuery matches (delayed by throttle).
  // Actually, for immediate feedback, localQuery is better even in autoSync mode.
  const displayValue = urlQuery
  const hasQuery = displayValue && displayValue.length > 0

  return (
    <div className="max-w-xl mx-auto relative group">
      <div className="absolute inset-0 bg-linear-to-r from-primary/20 via-primary/10 to-transparent rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative flex items-center">
        <input 
          type="text" 
          id="query"
          name="query"
          placeholder="曲名、本、アーティスト..." 
          value={displayValue}
          onChange={handleChange}
          className="w-full rounded-full bg-card border border-input text-foreground placeholder:text-muted-foreground py-3.5 pl-6 pr-24 text-base shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 hover:border-primary/50" 
        />
        
        <div className="absolute right-2 flex items-center gap-1">
          {hasQuery && (
            <button 
              onClick={handleClear}
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
            className="p-2.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm active:scale-95" 
            aria-label="Search"
            type="submit"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
