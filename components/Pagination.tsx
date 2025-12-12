import React from 'react'

type Props = {
  currentPage: number
  totalPages: number
  hasPrev: boolean
  hasNext: boolean
  endpoint?: string
  query?: Record<string, any>
}

function toQueryString(q: Record<string, any> = {}) {
  const params = new URLSearchParams()
  Object.entries(q).forEach(([k, v]) => {
    if (v !== undefined && v !== null) params.set(k, String(v))
  })
  return params.toString()
}

export default function Pagination({ currentPage, totalPages, hasPrev, hasNext, endpoint = '/', query = {} }: Props) {
  const q = { ...query }
  
  const baseButtonClass = "inline-flex items-center justify-center h-10 w-10 rounded-full border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
  const activeClass = "border-border bg-card hover:bg-muted text-foreground"
  const disabledClass = "border-border bg-muted text-muted-foreground opacity-50 cursor-not-allowed"

  return (
    <div className="p-8 flex justify-center">
      <nav aria-label="Pagination">
        <ul className="flex items-center gap-2">
          <li>
            {hasPrev ? (
              <a href={`${endpoint}?${toQueryString({ ...q, page: currentPage - 1 })}`} className={`${baseButtonClass} ${activeClass}`}>
                <span className="sr-only">Previous</span>
                ◀
              </a>
            ) : (
              <span className={`${baseButtonClass} ${disabledClass}`}>
                <span className="sr-only">Previous</span>
                ◀
              </span>
            )}
          </li>

          <li>
            <span className="mx-4 text-sm font-medium text-muted-foreground">
              Page <span className="text-foreground font-bold">{currentPage}</span> of {totalPages}
            </span>
          </li>

          <li>
            {hasNext ? (
              <a href={`${endpoint}?${toQueryString({ ...q, page: currentPage + 1 })}`} className={`${baseButtonClass} ${activeClass}`}>
                <span className="sr-only">Next</span>
                ▶
              </a>
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
