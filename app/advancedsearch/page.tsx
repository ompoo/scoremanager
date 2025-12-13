import React from 'react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import ExtraSearch from '../../components/ExtraSearch'
import Pagination from '../../components/Pagination'
import { searchParamsCache } from '@/lib/searchParams'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Tables } from '@/types/supabase'

const ITEMS_PER_PAGE = 20;

type SongWithDetails = Pick<Tables<'songs'>, 'id' | 'song_name' | 'grade' | 'memo'> & {
  books: Pick<Tables<'books'>, 'id' | 'book_name'> | null;
  artists: Pick<Tables<'artists'>, 'Artist_name'>[] | null;
  lyricists: Pick<Tables<'lyricists'>, 'lyricist_name'>[] | null;
  song_writers: Pick<Tables<'songwriters'>, 'song_writer_name'>[] | null;
  arrangers: Pick<Tables<'arrangers'>, 'arranger_name'>[] | null;
}

export default async function AdvancedSearch({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
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
  } = searchParamsCache.parse(await searchParams)

  const supabase = await createClient()

  // Base Query Selection
  // We select standard fields plus related data for display.
  // For filtering on related tables, we need to apply the filter to the relation.
  // Supabase postgrest syntax allows filtering on joined tables.
  
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
  let queryBuilder = supabase.from('songs').select(selects.join(','), { count: 'exact' })

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
  
  const { data, count, error } = await queryBuilder.range(from, to).order('created_at', { ascending: false })

  const songs = data as unknown as SongWithDetails[] | null

  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 0;

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
