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

type SongWithDetails = Pick<Tables<'songs'>, 'id' | 'song_name' | 'grade' | 'memo' | 'book_id'> & {
  books: Pick<Tables<'books'>, 'id' | 'book_name'> | null;
  artists: Pick<Tables<'artists'>, 'Artist_name'>[] | null;
  lyricists: Pick<Tables<'lyricists'>, 'lyricist_name'>[] | null;
  songwriters: Pick<Tables<'songwriters'>, 'song_writer_name'>[] | null;
  arrangers: Pick<Tables<'arrangers'>, 'arranger_name'>[] | null;
}

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

  const supabase = await createClient()

  // Base Query Selection
  const selects = [
    'id', 'song_name', 'grade', 'memo', 'book_id',
    // Always fetch book info
    book ? 'books!inner(id, book_name)' : 'books(id, book_name)',
    // Relations
    artist ? 'artists!inner(Artist_name)' : 'artists(Artist_name)',
    lyricist ? 'lyricists!inner(lyricist_name)' : 'lyricists(lyricist_name)',
    songWriter ? 'songwriters!inner(song_writer_name)' : 'songwriters(song_writer_name)',
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
  if (songWriter) queryBuilder = queryBuilder.ilike('songwriters.song_writer_name', `%${songWriter}%`)
  if (arranger) queryBuilder = queryBuilder.ilike('arrangers.arranger_name', `%${arranger}%`)

  // Pagination
  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;
  
  const { data, count, error } = await queryBuilder.range(from, to).order('created_at', { ascending: false })

  const songs = data as unknown as SongWithDetails[] | null

  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 0;
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
          <div className="space-y-4">
            {songs && songs.length > 0 ? (
              songs.map((song) => (
                <div 
                  key={song.id} 
                  className="group relative flex flex-row gap-3 p-3 sm:p-4 rounded-xl border border-border bg-card shadow-xs transition-all duration-200 hover:shadow-md hover:border-primary/20"
                >
                  {/* Icon Column */}
                  <div className="shrink-0">
                     <div className="p-2 sm:p-3 rounded-full bg-green-100/50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                       <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-6 sm:h-6">
                         <path d="M9 18V5l12-2v13"/>
                         <circle cx="6" cy="18" r="3"/>
                         <circle cx="18" cy="16" r="3"/>
                       </svg>
                     </div>
                  </div>

                  {/* Content Column */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-2">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-medium px-2 py-0.5 rounded-full shrink-0 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                            Song
                          </span>
                          <div className="flex items-center gap-2 text-muted-foreground min-w-0 truncate">
                            {song.grade && (
                              <span className="flex items-center gap-1 shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                </svg>
                                Grade {song.grade}
                              </span>
                            )}
                            {song.books && (
                              <span className="flex items-center gap-1 min-w-0 truncate">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                                  <path d="m16 6 4 14"/>
                                  <path d="M12 6v14"/>
                                  <path d="M8 8v12"/>
                                  <path d="M4 4v16"/>
                                </svg>
                                <span className="truncate">{song.books.book_name}</span>
                              </span>
                            )}
                          </div>
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold leading-tight group-hover:text-primary transition-colors truncate">
                          <Link href={`/book/${song.book_id}`} className="focus:outline-hidden before:absolute before:inset-0">
                            {song.song_name}
                          </Link>
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Action Icon (Chevron) */}
                  <div className="hidden sm:flex items-center justify-center pl-2 text-muted-foreground/50 group-hover:text-primary transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-muted/10 rounded-2xl border-2 border-dashed border-border">
                <p className="text-muted-foreground text-lg">条件に一致する結果は見つかりませんでした。</p>
                <p className="text-sm text-muted-foreground/60 mt-1">検索条件を変えて再度お試しください。</p>
              </div>
            )}
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
