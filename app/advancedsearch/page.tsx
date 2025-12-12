import React from 'react'
import Header from '../../app/components/Header'
import Footer from '../../app/components/Footer'
import ExtraSearch from '../../app/components/ExtraSearch'
import Pagination from '../../app/components/Pagination'

export default function AdvancedSearch({ searchParams }: { searchParams?: any }) {
  const page = Number(searchParams?.page || 1)
  const songs: any[] = []
  return (
    <div className="mx-auto w-full">
      <header><Header /></header>
      <ExtraSearch />
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={page} totalPages={1} hasPrev={false} hasNext={false} endpoint="/advancedsearch" />
      <Footer />
    </div>
  )
}
