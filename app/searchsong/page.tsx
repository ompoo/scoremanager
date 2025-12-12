import React from 'react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import SearchBar from '../../components/SearchBar'
import Pagination from '../../components/Pagination'
import { searchParamsCache } from '@/lib/searchParams'

export default function SearchSong({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const { query, page } = searchParamsCache.parse(searchParams)
  const songs: any[] = []
  
  return (
    <main className="min-h-screen flex flex-col bg-background text-foreground">
      <Header small />
      
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">曲の検索</h1>
          <p className="text-muted-foreground">曲名やアーティスト名から楽譜を探せます</p>
        </div>

        <div className="max-w-xl mx-auto w-full">
          <SearchBar />
        </div>

        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-muted text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Song Name</th>
                  <th className="px-6 py-4 font-medium">Book Name</th>
                  <th className="px-6 py-4 font-medium">Artist</th>
                  <th className="px-6 py-4 font-medium">Lyricist</th>
                  <th className="px-6 py-4 font-medium">SongWriter</th>
                  <th className="px-6 py-4 font-medium">Arranger</th>
                  <th className="px-6 py-4 font-medium">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {songs.length > 0 ? (
                  songs.map((song, idx) => (
                    <tr key={idx} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{song.song_name}</td>
                      <td className="px-6 py-4">
                        <a href={`/book/${song.book_id}`} className="text-primary hover:underline underline-offset-4">
                          {song.parent_book?.book_name}
                        </a>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{song.artists?.map((a: any) => a.Artist_name).join(', ')}</td>
                      <td className="px-6 py-4 text-muted-foreground">{song.lyricists?.map((a: any) => a.lyricist_name).join(', ')}</td>
                      <td className="px-6 py-4 text-muted-foreground">{song.song_writers?.map((a: any) => a.song_writer_name).join(', ')}</td>
                      <td className="px-6 py-4 text-muted-foreground">{song.arrangers?.map((a: any) => a.arranger_name).join(', ')}</td>
                      <td className="px-6 py-4 text-muted-foreground">{song.grade}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                      No songs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Pagination currentPage={page} totalPages={1} hasPrev={false} hasNext={false} endpoint="/searchsong" query={{ query }} />
      </div>

      <Footer />
    </main>
  )
}
