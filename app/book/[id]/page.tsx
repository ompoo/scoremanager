import React from 'react'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'

export default function BookPage({ params }: { params: { id: string } }) {
  const id = params.id
  const book: any = null
  const songs: any[] = []
  return (
    <div className="mx-auto max-w-screen-lg">
      <header><Header /></header>
      <div className="h-fit rounded-lg bg-gray-100 shadow-lg mx-auto sm:max-w-[60%] p-3">
        <a href="#">
          <img src="https://www.ymm.co.jp/p/cover/placeholder.gif" loading="lazy" className="object-contain max-h-[25vh] mx-auto" />
        </a>
      </div>

      <h1 className="mb-2 mt-5 text-center text-2xl font-bold text-gray-800 md:text-3xl">{book?.book_name || `Book ${id}`}</h1>
      <h1 className="mb-2 mt-5 text-center text-xl font-bold text-gray-800 sm:text-left sm:text-xl">収録曲</h1>

      <div className="overflow-auto">
        <div className="w-[150%] min-w-[750px]">
          <table className="w-full border-collapse bg-white object-center text-left text-sm text-gray-500 ">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 font-medium text-gray-900">song name</th>
                <th className="px-6 py-4 font-medium text-gray-900">Artist</th>
                <th className="px-6 py-4 font-medium text-gray-900">Lyricist</th>
                <th className="px-6 py-4 font-medium text-gray-900">SongWriter</th>
                <th className="px-6 py-4 font-medium text-gray-900">Arranger</th>
                <th className="px-6 py-4 font-medium text-gray-900">Grade</th>
              </tr>
            </thead>
            <tbody className=" divide-y divide-gray-100 border-t border-gray-100">
              {songs.map((song, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{song.song_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Footer />
    </div>
  )
}
