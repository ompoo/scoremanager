import React from 'react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import ExtraSearch from '../../components/ExtraSearch'
import Pagination from '../../components/Pagination'
import { searchParamsCache } from '@/lib/searchParams'
import Link from 'next/link'
import { advancedSearchSongs } from '@/lib/getdataFromSupabase'

export default async function AdvancedSearch(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const searchParams = await props.searchParams
  const { 
    page, 
    book, 
    song, 
    artist, 
    lyricist, 
    songWriter, 
    arranger, 
    grade, 
    memo 
  } = searchParamsCache.parse(searchParams)

  // Use the advancedSearchSongs function from getdataFromSupabase
  const { songs, totalCount, totalPages, error } = await advancedSearchSongs({
    book,
    song,
    artist,
    lyricist,
    songWriter,
    arranger,
    grade,
    memo,
    page
  })

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  // Helper
  const formatNames = <T,>(arr: T[] | null | undefined, nameKey: keyof T) => 
    arr?.map((item) => String(item[nameKey])).join(', ') || '-';

  return (
    <main className="min-h-screen flex flex-col bg-background text-foreground">
      <Header small />
      
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">詳細検索</h1>
          <p className="text-muted-foreground">複数の条件を組み合わせて検索できます</p>
        </div>

        <div className="flex justify-center">
          <ExtraSearch />
        </div>

        {error ? (
           <div className="text-center text-destructive p-4">エラーが発生しました: {error.message}</div>
        ) : (
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-muted text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-medium">Song Name</th>
                    <th className="px-6 py-4 font-medium">Book Name</th>
                    <th className="px-6 py-4 font-medium">Artist</th>
                    <th className="px-6 py-4 font-medium">Lyricist</th>
                    <th className="px-6 py-4 font-medium">Composer</th>
                    <th className="px-6 py-4 font-medium">Arranger</th>
                    <th className="px-6 py-4 font-medium">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {songs && songs.length > 0 ? (
                    songs.map((song) => (
                      <tr key={song.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground">
                           <Link href={`/book/${song.book_id}`} className="hover:underline hover:text-primary transition-colors">
                              {song.song_name}
                           </Link>
                        </td>
                        <td className="px-6 py-4">
                           {song.books ? (
                              <Link href={`/book/${song.books.id}`} className="text-primary hover:underline underline-offset-4">
                                {song.books.book_name}
                              </Link>
                           ) : '-'}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{formatNames(song.artists, 'Artist_name')}</td>
                        <td className="px-6 py-4 text-muted-foreground">{formatNames(song.lyricists, 'lyricist_name')}</td>
                        <td className="px-6 py-4 text-muted-foreground">{formatNames(song.songwriters, 'song_writer_name')}</td>
                        <td className="px-6 py-4 text-muted-foreground">{formatNames(song.arrangers, 'arranger_name')}</td>
                        <td className="px-6 py-4 text-muted-foreground">{song.grade || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                        条件に一致する曲は見つかりませんでした。
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {totalPages > 1 && (
            <Pagination 
              totalPages={totalPages}
              hasPrev={hasPrev}
              hasNext={hasNext}
            />
        )}
      </div>

      <Footer />
    </main>
  )
}
