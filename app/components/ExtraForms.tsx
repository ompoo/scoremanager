"use client"
import React from 'react'

type Props = {
  values?: Record<string, string>
}

export default function ExtraForms({ values = {} }: Props) {
  const v = (k: string) => values[k] || ''
  return (
    <>
      <label htmlFor="book" className="block mt-2 text-sm font-medium text-gray-900">Book Name</label>
      <input id="book" name="book" defaultValue={v('book')} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5" />

      <label htmlFor="song_name" className="block mt-2 text-sm font-medium text-gray-900">Song Name</label>
      <input id="song_name" name="song" defaultValue={v('song')} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5" />

      <label htmlFor="artist" className="block mt-2 text-sm font-medium text-gray-900">Artist</label>
      <input id="artist" name="artist" defaultValue={v('artist')} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5" />

      <label htmlFor="lyricist" className="block mt-2 text-sm font-medium text-gray-900">Lyricist</label>
      <input id="lyricist" name="lyricist" defaultValue={v('lyricist')} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5" />

      <label htmlFor="song_writer" className="block mt-2 text-sm font-medium text-gray-900">Song Writer</label>
      <input id="song_writer" name="songWriter" defaultValue={v('songWriter')} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5" />

      <label htmlFor="arranger" className="block mt-2 text-sm font-medium text-gray-900">Arranger</label>
      <input id="arranger" name="arranger" defaultValue={v('arranger')} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5" />

      <label htmlFor="sgrade" className="block mt-2 text-sm font-medium text-gray-900">Grade</label>
      <input id="sgrade" name="grade" defaultValue={v('grade')} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5" />

      <label htmlFor="memo" className="block mt-2 text-sm font-medium text-gray-900">Memo</label>
      <input id="memo" name="memo" defaultValue={v('memo')} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5" />
    </>
  )
}
