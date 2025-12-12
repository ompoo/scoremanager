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
  return (
    <div className="p-4 flex justify-center">
      <nav aria-label="Pagination">
        <ul className="inline-flex items-center space-x-1 rounded-md text-sm">
          <li>
            {hasPrev ? (
              <a href={`${endpoint}?${toQueryString({ ...q, page: currentPage - 1 })}`} className="inline-flex items-center space-x-2 rounded-full border border-gray-300 bg-white px-2 py-2 font-medium text-gray-500 hover:bg-gray-50">
                ◀
              </a>
            ) : (
              <span className="inline-flex items-center space-x-2 rounded-full border border-gray-300 bg-white px-2 py-2 font-medium text-gray-300">◀</span>
            )}
          </li>

          <li>
            <span className="inline-flex items-center space-x-1 rounded-md bg-white px-4 py-2 text-gray-500">Page <b className="mx-1">{currentPage}</b> of <b className="ml-1">{totalPages}</b></span>
          </li>

          <li>
            {hasNext ? (
              <a href={`${endpoint}?${toQueryString({ ...q, page: currentPage + 1 })}`} className="inline-flex items-center space-x-2 rounded-full border border-gray-300 bg-white px-2 py-2 font-medium text-gray-500 hover:bg-gray-50">▶</a>
            ) : (
              <span className="inline-flex items-center space-x-2 rounded-full border border-gray-300 bg-white px-2 py-2 font-medium text-gray-300">▶</span>
            )}
          </li>
        </ul>
      </nav>
    </div>
  )
}
