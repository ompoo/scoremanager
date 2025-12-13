"use client"
import { searchParamsParsers } from '@/lib/searchParams'
import  {useQueryState}  from 'nuqs'

type Props = {
  totalPages: number
  hasPrev: boolean
  hasNext: boolean
}

export default function Pagination({totalPages, hasPrev, hasNext }: Props) {
  const [urlQuery, setUrlQuery] = useQueryState('page', searchParamsParsers.page.withOptions({ 
    shallow: false
  }))

  const handleNextPage = () => {
    if (hasNext){
      setUrlQuery(urlQuery + 1)
    }
  }

  const handlePrevPage = () => {
    if (hasPrev && urlQuery > 1 ){
      setUrlQuery(urlQuery - 1)
    }
  }

  const baseButtonClass = "inline-flex items-center justify-center h-10 w-10 rounded-full border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
  const activeClass = "border-border bg-card hover:bg-muted text-foreground"
  const disabledClass = "border-border bg-muted text-muted-foreground opacity-50 cursor-not-allowed"

  return (
    <div className="p-8 flex justify-center">
      <nav aria-label="Pagination">
        <ul className="flex items-center gap-2">
          <li>
            {hasPrev ? (
              <button onClick={handlePrevPage} className={`${baseButtonClass} ${activeClass}`}>
                <span className="sr-only">Previous</span>
                ◀
              </button>
            ) : (
              <span className={`${baseButtonClass} ${disabledClass}`}>
                <span className="sr-only">Previous</span>
                ◀
              </span>
            )}
          </li>

          <li>
            <span className="mx-4 text-sm font-medium text-muted-foreground">
              Page <span className="text-foreground font-bold">{urlQuery ?? 1}</span> of {totalPages}
            </span>
          </li>

          <li>
            {hasNext ? (
              <button onClick={handleNextPage} className={`${baseButtonClass} ${activeClass}`}>
                <span className="sr-only">Next</span>
                ▶
              </button>
            ) : (
              <span className={`${baseButtonClass} ${disabledClass}`}>
                <span className="sr-only">Next</span>
                ▶
              </span>
            )}
          </li>
        </ul>
      </nav>
    </div>
  )
}
