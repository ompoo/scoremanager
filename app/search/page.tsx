import Header from '../../components/Header'
import Footer from '../../components/Footer'
import SearchBar from '../../components/SearchBar'
import { searchParamsCache } from '@/lib/searchParams'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import SearchTypeFilter from '../../components/SearchTypeFilter'
import Pagination from '../../components/Pagination'
import { Tables } from '@/types/supabase'

type SongSummary = Pick<Tables<'songs'>, 'id' | 'song_name' | 'grade' | 'created_at'> & { resultType: 'song' }
type BookSummary = Pick<Tables<'books'>, 'id' | 'book_name' | 'created_at'> & { resultType: 'book' }

type SearchResultItem = SongSummary | BookSummary

export default async function SearchPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const searchParams = await props.searchParams
  const { query, type, page } = searchParamsCache.parse(searchParams)

  const ITEMS_PER_PAGE = 10
  const offset = (page - 1) * ITEMS_PER_PAGE
  
  const supabase = await createClient()
  
  let results: SearchResultItem[] = []
  let totalCount = 0
  let totalPages = 0

  // Helper to fetch books
  const fetchBooks = async () => {
    let queryBuilder = supabase
      .from('books')
      .select('id, book_name, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + ITEMS_PER_PAGE - 1)

    if (query) {
      queryBuilder = queryBuilder.ilike('book_name', `%${query}%`)
    }
    
    return await queryBuilder
  }

  // Helper to fetch songs
  const fetchSongs = async () => {
    let queryBuilder = supabase
      .from('songs')
      .select('id, song_name, grade, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + ITEMS_PER_PAGE - 1)

    if (query) {
      queryBuilder = queryBuilder.ilike('song_name', `%${query}%`)
    }

    return await queryBuilder
  }

  if (type === 'book') {
    const { data, count } = await fetchBooks()
    if (data) {
      results = data.map(d => ({ ...d, resultType: 'book' }))
    }
    totalCount = count || 0
    totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  } else if (type === 'song') {
    const { data, count } = await fetchSongs()
    if (data) {
      results = data.map(d => ({ ...d, resultType: 'song' }))
    }
    totalCount = count || 0
    totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  } else {
    // type === 'all'
    const [booksRes, songsRes] = await Promise.all([fetchBooks(), fetchSongs()])
    
    const booksData = booksRes.data?.map(d => ({ ...d, resultType: 'book' as const })) || []
    const songsData = songsRes.data?.map(d => ({ ...d, resultType: 'song' as const })) || []
    
    // Combine and sort by created_at desc
    results = [...booksData, ...songsData].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    const booksCount = booksRes.count || 0
    const songsCount = songsRes.count || 0
    
    // For 'all' view, use the max pages of either category to allow navigation
    // This is a simplified approach for mixed pagination
    const booksPages = Math.ceil(booksCount / ITEMS_PER_PAGE)
    const songsPages = Math.ceil(songsCount / ITEMS_PER_PAGE)
    totalPages = Math.max(booksPages, songsPages)
    totalCount = booksCount + songsCount
  }

  const hasPrev = page > 1
  const hasNext = page < totalPages

  return (
    <main className="min-h-screen flex flex-col bg-background text-foreground">
      <Header small />
      
      <div className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 space-y-8">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">検索結果</h1>
            <p className="text-muted-foreground">
              {query ? `"${query}" の検索結果: ${totalCount}件` : `全件表示: ${totalCount}件`}
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
                    <th className="px-6 py-3 w-25 font-medium">Type</th>
                    <th className="px-6 py-3 font-medium">Name</th>
                    <th className="px-6 py-3 font-medium">Info</th>
                    <th className="px-6 py-3 font-medium w-37.5">Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {results.length > 0 ? (
                    results.map((item) => (
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
                        <td className="px-6 py-3 text-muted-foreground max-w-75 truncate">
                          <span className="text-xs mr-2">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                          {item.resultType === 'song' && item.grade && (
                             <span className="text-xs border border-border px-1 rounded">{item.grade}</span>
                          )}
                        </td>
                        <td className="px-6 py-3">
                           {item.resultType === 'book' ? (
                              <Link href={`/book/${item.id}`} className="text-primary hover:underline">
                                詳細を見る &rarr;
                              </Link>
                           ) : (
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
          
          {totalPages > 1 && (
            <Pagination 
              totalPages={totalPages}
              hasPrev={hasPrev}
              hasNext={hasNext}
            />
          )}
        </div>

      </div>

      <Footer />
    </main>
  )
}