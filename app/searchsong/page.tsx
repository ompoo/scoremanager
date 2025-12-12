import React from 'react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import SearchBar from '../../components/SearchBar'
import Pagination from '../../components/Pagination'
import { searchParamsCache } from '@/lib/searchParams'
import { createClient } from '@/utils/supabase/server'

const ITEMS_PER_PAGE = 10;

export default async function SearchSong({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const { query, page } = searchParamsCache.parse(searchParams)

  const supabase = await createClient() // Make this await as createClient is async

  // Construct the select query for songs with joins
  // Assuming tables are named 'books', 'artists', 'lyricists', 'song_writers', 'arrangers'
  // and join tables if many-to-many. For simplicity, assuming direct foreign keys or implicit joins via Supabase.
  const selectQuery = `
    id, 
    song_name, 
    grade, 
    books(book_name), 
    artists(Artist_name), 
    lyricists(lyricist_name), 
    song_writers(song_writer_name), 
    arrangers(arranger_name)
  `

  // Fetch total count for pagination
  let countQuery = supabase.from('songs').select('id', { count: 'exact', head: true })
  if (query) {
    countQuery = countQuery.ilike('song_name', `%${query}%`)
  }
  const { count, error: countError } = await countQuery

  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 0;
  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  // Fetch songs for the current page
  let songsQuery = supabase.from('songs').select(selectQuery)
  if (query) {
    songsQuery = songsQuery.ilike('song_name', `%${query}%`)
  }
  const { data: songs, error } = await songsQuery.range(from, to)
  
  if (countError || error) {
    console.error('Error fetching songs:', countError || error)
    // In a real app, you might want to display an error message to the user
    return (
      <main className="min-h-screen flex flex-col bg-background text-foreground">
        <Header small />
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 space-y-8 text-center text-destructive">
          <p>曲の取得中にエラーが発生しました。</p>
        </div>
        <Footer />
      </main>
    )
  }

  // Adjusting for potential nulls from join tables and using flatMap for simplicity
  const formatNames = (arr: any[] | null | undefined, nameKey: string) => 
    arr?.map((item: any) => item[nameKey]).join(', ') || '-';

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
                {songs && songs.length > 0 ? (
                  songs.map((song: any) => (
                    <tr key={song.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{song.song_name}</td>
                      <td className="px-6 py-4">
                        {song.books?.book_name ? (
                            <a href={`/book/${song.book_id}`} className="text-primary hover:underline underline-offset-4">
                              {song.books.book_name}
                            </a>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{formatNames(song.artists, 'Artist_name')}</td>
                      <td className="px-6 py-4 text-muted-foreground">{formatNames(song.lyricists, 'lyricist_name')}</td>
                      <td className="px-6 py-4 text-muted-foreground">{formatNames(song.song_writers, 'song_writer_name')}</td>
                      <td className="px-6 py-4 text-muted-foreground">{formatNames(song.arrangers, 'arranger_name')}</td>
                      <td className="px-6 py-4 text-muted-foreground">{song.grade || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                      {query ? '検索条件に一致する曲は見つかりませんでした。' : '曲が登録されていません。'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Pagination currentPage={page} totalPages={totalPages} hasPrev={page > 1} hasNext={page < totalPages} endpoint="/searchsong" query={{ query }} />
      </div>

      <Footer />
    </main>
  )
}
