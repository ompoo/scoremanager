import React from 'react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import ExtraSearch from '../../components/ExtraSearch'
import Pagination from '../../components/Pagination'
import { searchParamsCache } from '@/lib/searchParams'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

const ITEMS_PER_PAGE = 20;

export default async function AdvancedSearch({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
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

  const supabase = await createClient()

  // Base Query Selection
  // We select standard fields plus related data for display.
  // For filtering on related tables, we need to apply the filter to the relation.
  // Supabase postgrest syntax allows filtering on joined tables.
  
  let queryBuilder = supabase.from('songs').select(`
    id, 
    song_name, 
    grade, 
    memo,
    books!inner(id, book_name),
    artists(Artist_name),
    lyricists(lyricist_name),
    song_writers(song_writer_name),
    arrangers(arranger_name)
  `, { count: 'exact' })

  // Apply Filters
  
  // 1. Song Name
  if (song) {
    queryBuilder = queryBuilder.ilike('song_name', `%${song}%`)
  }

  // 2. Grade
  if (grade) {
    queryBuilder = queryBuilder.ilike('grade', `%${grade}%`)
  }

  // 3. Memo
  if (memo) {
    queryBuilder = queryBuilder.ilike('memo', `%${memo}%`)
  }

  // 4. Book Name (Related)
  // We used !inner in select for books because usually every song has a book, 
  // and we want to filter by it if provided.
  if (book) {
    queryBuilder = queryBuilder.ilike('books.book_name', `%${book}%`)
  }

  // 5. Artist (Related Many-to-Many)
  // To filter by a many-to-many relation field, we use the !inner modifier on the join
  // BUT we also want to fetch ALL artists for display, not just the matched one.
  // Supabase/PostgREST is tricky here. If we filter `artists!inner(Artist_name)`, 
  // the returned `artists` array might only contain the matched artist.
  // A common workaround is to modify the query logic or accept this behavior.
  // For searching, seeing "why it matched" is often good enough.
  // Let's use !inner on a separate alias or just accept standard behavior for now.
  // Actually, let's try standard filtering on the relation.
  if (artist) {
    // This syntax filters the PARENT rows (songs) based on CHILD conditions.
    // We need to use !inner to ensure it acts as a filter for the song, not just the nested array.
    // However, if we do `artists!inner(Artist_name)`, the returned `artists` array will ONLY have matching artists.
    // To show ALL artists, we would technically need a second query or a more complex one.
    // For this prototype, showing only matching artists in the result column is acceptable 
    // or we assume most songs have few artists.
    // Let's refine the select to separate filter vs display if needed, but simple is better first.
    
    // Re-defining select for filtering purposes if needed is hard in one chain.
    // We will use the direct !inner approach.
    // Note: We need to change the select string above to use !inner if filter is present?
    // No, we can modify the modifier dynamically? No.
    // We can't easily switch select clause dynamically with method chaining cleanly for !inner.
    // So we will stick to: if you search by artist, we assume you want to see that artist.
    
    // Ideally we would use `not.is.artists`, null? No.
    // Let's rely on the query builder's ability to filter deeply.
    queryBuilder = queryBuilder.not('artists', 'is', null) // Dummy check? No.
    
    // The correct PostgREST way for "Has an artist matching X" is tricky without !inner.
    // If we use !inner, it works as a filter.
    // We need to construct the select string based on filters to add !inner dynamically.
  }
  
  // Re-constructing select string based on needs
  const selects = [
    'id', 'song_name', 'grade', 'memo',
    // Always fetch book info
    book ? 'books!inner(id, book_name)' : 'books(id, book_name)',
    // Relations
    artist ? 'artists!inner(Artist_name)' : 'artists(Artist_name)',
    lyricist ? 'lyricists!inner(lyricist_name)' : 'lyricists(lyricist_name)',
    songWriter ? 'song_writers!inner(song_writer_name)' : 'song_writers(song_writer_name)',
    arranger ? 'arrangers!inner(arranger_name)' : 'arrangers(arranger_name)',
  ]
  
  // Reset builder with dynamic select
  queryBuilder = supabase.from('songs').select(selects.join(','), { count: 'exact' })

  // Re-apply filters
  if (song) queryBuilder = queryBuilder.ilike('song_name', `%${song}%`)
  if (grade) queryBuilder = queryBuilder.ilike('grade', `%${grade}%`)
  if (memo) queryBuilder = queryBuilder.ilike('memo', `%${memo}%`)
  
  if (book) queryBuilder = queryBuilder.ilike('books.book_name', `%${book}%`)
  if (artist) queryBuilder = queryBuilder.ilike('artists.Artist_name', `%${artist}%`)
  if (lyricist) queryBuilder = queryBuilder.ilike('lyricists.lyricist_name', `%${lyricist}%`)
  if (songWriter) queryBuilder = queryBuilder.ilike('song_writers.song_writer_name', `%${songWriter}%`)
  if (arranger) queryBuilder = queryBuilder.ilike('arrangers.arranger_name', `%${arranger}%`)

  // Pagination
  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;
  
  const { data: songs, count, error } = await queryBuilder.range(from, to).order('created_at', { ascending: false })

  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 0;

  // Helper
  const formatNames = (arr: any[] | null | undefined, nameKey: string) => 
    arr?.map((item: any) => item[nameKey]).join(', ') || '-';

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
                    songs.map((song: any) => (
                      <tr key={song.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground">{song.song_name}</td>
                        <td className="px-6 py-4">
                           {song.books ? (
                              <Link href={`/book/${song.books.id}`} className="text-primary hover:underline underline-offset-4">
                                {song.books.book_name}
                              </Link>
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
                        条件に一致する曲は見つかりませんでした。
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        <Pagination currentPage={page} totalPages={totalPages} hasPrev={page > 1} hasNext={page < totalPages} endpoint="/advancedsearch" />
      </div>

      <Footer />
    </main>
  )
}
