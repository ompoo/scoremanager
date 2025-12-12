"use client"
import React from 'react'
import { useQueryState } from 'nuqs'

export default function SearchTypeFilter() {
  const [type, setType] = useQueryState('type', { 
    defaultValue: 'all',
    shallow: false // Server filter needs refresh
  })

  const tabs = [
    { id: 'all', label: 'すべて' },
    { id: 'book', label: '📚 本 (Books)' },
    { id: 'song', label: '🎵 曲 (Songs)' },
  ]

  return (
    <div className="flex items-center gap-2 border-b border-border w-full">
      {tabs.map((tab) => {
        const isActive = type === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => setType(tab.id === 'all' ? null : tab.id)}
            className={`
              px-4 py-2 text-sm font-medium transition-all relative
              ${isActive 
                ? 'text-primary' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-t-md'
              }
            `}
          >
            {tab.label}
            {isActive && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
            )}
          </button>
        )
      })}
    </div>
  )
}
