import React from 'react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import SearchBar from '../../components/SearchBar'
import { searchParamsCache } from '@/lib/searchParams'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import SearchTypeFilter from '../../components/SearchTypeFilter'

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const resolvedParams = await searchParams
  console.log('Resolved Raw Search Params:', resolvedParams) // New debug log

  const { query, type } = searchParamsCache.parse(resolvedParams)
  console.log('Parsed Search Params:', { query, type }) // Updated log, was 'Search Params'

  const supabase = await createClient()


  // Prepare queries based on type
  const fetchSongs = type === 'all' || type === 'song'
  const fetchBooks = type === 'all' || type === 'book'

  let songs: any[] = []
  let books: any[] = []

  if (fetchSongs) {
    console.log('Starting song fetch...')
    let songQuery = supabase.from('songs')
      .select('id, song_name, grade') // Simplified query for debugging
      .limit(20)
    
    if (query) {
      songQuery = songQuery.ilike('song_name', `%${query}%`)
    }

    const { data, error } = await songQuery
    
    if (error) {
      console.error('Error fetching songs:', error)
    } else if (data) {
      songs = data
      console.log('Fetched songs count:', songs.length)
    }
  }

  if (fetchBooks) {
    console.log('Starting book fetch...')
    let bookQuery = supabase.from('books')
      .select('id, book_name, created_at')
      .limit(20)

    if (query) {
      bookQuery = bookQuery.ilike('book_name', `%${query}%`)
    }

    const { data, error } = await bookQuery

    if (error) {
      console.error('Error fetching books:', error)
    } else if (data) {
      books = data
      console.log('Fetched books count:', books.length)
    }
  }

  // Merge results
  const results = [
    ...books.map((b: any) => ({ ...b, resultType: 'book' })),
    ...songs.map((s: any) => ({ ...s, resultType: 'song' }))
  ]

  // Helper for names
  const formatNames = (arr: any[] | null | undefined, nameKey: string) => 
    arr?.map((item: any) => item[nameKey]).join(', ') || '-';

  return (
    <main className="min-h-screen flex flex-col bg-background text-foreground">
      <Header small />
      
      <div className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 space-y-8">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">検索結果</h1>
            <p className="text-muted-foreground">
              "{query}" の検索結果
            </p>
          </div>
          
          <div className="max-w-xl mx-auto w-full">
            <SearchBar />
          </div>
        </div>

        <div className="space-y-4">
          <SearchTypeFilter />
          
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-muted text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-6 py-3 w-[100px] font-medium">Type</th>
                    <th className="px-6 py-3 font-medium">Name</th>
                    <th className="px-6 py-3 font-medium">Info / Artists</th>
                    <th className="px-6 py-3 font-medium w-[150px]">Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {results.length > 0 ? (
                    results.map((item: any) => (
                      <tr key={`${item.resultType}-${item.id}`} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-3">
                          {item.resultType === 'book' ? (
                            <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-300">
                              📚 Book
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-300">
                              🎵 Song
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3 font-medium text-foreground">
                          {item.resultType === 'book' ? item.book_name : item.song_name}
                        </td>
                        <td className="px-6 py-3 text-muted-foreground max-w-[300px] truncate">
                          {item.resultType === 'book' ? (
                            <span className="text-xs">Added: {new Date(item.created_at).toLocaleDateString()}</span>
                          ) : (
                            <>
                              {/* Temporarily disabled relations display */}
                              <span className="text-xs text-muted-foreground">Detail info unavailable</span>
                              {item.grade && <span className="ml-2 text-xs border border-border px-1 rounded">{item.grade}</span>}
                            </>
                          )}
                        </td>
                        <td className="px-6 py-3">
                           {item.resultType === 'book' ? (
                              <Link href={`/book/${item.id}`} className="text-primary hover:underline">
                                詳細を見る &rarr;
                              </Link>
                           ) : (
                              // We don't have item.books.id now, so fallback to simple text or song link if we had a song detail page
                              <span className="text-muted-foreground">-</span>
                           )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                        見つかりませんでした。
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      <Footer />
    </main>
  )
}
