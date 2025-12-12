import React from 'react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import SearchBar from '../../components/SearchBar'
import Pagination from '../../components/Pagination'

export default function SearchSong({ searchParams }: { searchParams?: any }) {
  const que = searchParams?.query || ''
  const songs: any[] = []
  const page = Number(searchParams?.page || 1)
  return (
    <div className="mx-auto w-full">
      <header><Header /></header>
      <h1 className="text-center text-2xl font-bold mb-3">曲の検索</h1>
      <form method="get" action="/searchsong"><SearchBar value={que} /></form>

      <div className="overflow-hidden mt-5">
        <table className="border-collapse bg-white object-center text-left text-sm text-gray-500 w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4">song name</th>
              <th className="px-6 py-4">book name</th>
              <th className="px-6 py-4">Artist</th>
              <th className="px-6 py-4">Lyricist</th>
              <th className="px-6 py-4">SongWriter</th>
              <th className="px-6 py-4">Arranger</th>
              <th className="px-6 py-4">Grade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 border-t border-gray-100 text-gray-700">
            {songs.map((song, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-6 py-4">{song.song_name}</td>
                <td className="px-6 py-4 text-blue-800 hover:underline"><a href={`/book/${song.book_id}`}>{song.parent_book?.book_name}</a></td>
                <td className="px-6 py-4">{song.artists?.map((a: any) => a.Artist_name).join(' ')}</td>
                <td className="px-6 py-4">{song.lyricists?.map((a: any) => a.lyricist_name).join(' ')}</td>
                <td className="px-6 py-4">{song.song_writers?.map((a: any) => a.song_writer_name).join(' ')}</td>
                <td className="px-6 py-4">{song.arrangers?.map((a: any) => a.arranger_name).join(' ')}</td>
                <td className="px-6 py-4">{song.grade}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={page} totalPages={1} hasPrev={false} hasNext={false} endpoint="/searchsong" query={{ query: que }} />
      <Footer />
    </div>
  )
}
