"use client"
import React from 'react'

type Props = {
  values?: Record<string, string>
}

export default function ExtraForms({ values = {} }: Props) {
  const v = (k: string) => values[k] || ''
  
  const fields = [
    { id: 'book', label: 'Book Name', name: 'book' },
    { id: 'song_name', label: 'Song Name', name: 'song' },
    { id: 'artist', label: 'Artist', name: 'artist' },
    { id: 'lyricist', label: 'Lyricist', name: 'lyricist' },
    { id: 'song_writer', label: 'Song Writer', name: 'songWriter' },
    { id: 'arranger', label: 'Arranger', name: 'arranger' },
    { id: 'sgrade', label: 'Grade', name: 'grade' },
    { id: 'memo', label: 'Memo', name: 'memo' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      {fields.map((field) => (
        <div key={field.id} className="space-y-1">
          <label htmlFor={field.id} className="text-sm font-medium text-foreground">
            {field.label}
          </label>
          <input
            id={field.id}
            name={field.name}
            defaultValue={v(field.name)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      ))}
    </div>
  )
}
