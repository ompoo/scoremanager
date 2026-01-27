import { createClient } from '@/utils/supabase/server'
import { Tables } from '@/types/supabase'
import { SupabaseClient } from '@supabase/supabase-js'

type SongSummary = Pick<Tables<'songs'>, 'id' | 'song_name' | 'book_id' | 'grade' | 'created_at'> & { resultType: 'song', book_name?: string | null }
type BookSummary = Pick<Tables<'books'>, 'id' | 'book_name' | 'created_at'> & { resultType: 'book', matchedSongs?: SongSummary[] }

export type SearchResultItem = SongSummary | BookSummary

const ITEMS_PER_PAGE = 10



  // Helper to fetch books
const fetchBooks = async (supabase: SupabaseClient, query: string, offset: number) => {
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
const fetchSongs = async (supabase: SupabaseClient, query: string, offset: number) => {
    let queryBuilder = supabase
      .from('songs')
      .select('id, song_name, grade, created_at, book_id, books(book_name)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + ITEMS_PER_PAGE - 1)

    if (query) {
      queryBuilder = queryBuilder.ilike('song_name', `%${query}%`)
    }

    return await queryBuilder
}


export async function searchBooksAndSongs(
  query: string,
  type: 'book' | 'song' | 'all',
  page: number
) {
  const offset = (page - 1) * ITEMS_PER_PAGE
  const supabase = await createClient()
  
  let results: SearchResultItem[] = []
  let totalCount = 0
  let totalPages = 0

  
  // book search
  if (type === 'book') {
    const { data, count } = await fetchBooks(supabase, query, offset)
    if (data) {
      results = data.map(d => ({ ...d, resultType: 'book' }))
    }
    totalCount = count || 0
    totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

　// song search
  } else if (type === 'song') {
    const { data, count } = await fetchSongs(supabase, query, offset)
    if (data) {
      results = data.map(d => ({
        id: d.id,
        song_name: d.song_name,
        grade: d.grade,
        created_at: d.created_at,
        book_id: d.book_id,
        book_name: (d.books as any) instanceof Array ? (d.books as any)[0]?.book_name : (d.books as any)?.book_name,
        resultType: 'song'
      }))
    }
    totalCount = count || 0
    totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)
    
  // all search default
  } else {
    // type === 'all'
    // Use PostgreSQL function with UNION ALL for efficient search
    const { data, error } = await supabase
      .rpc('search_books_and_songs', {
        search_query: query || '',
        limit_count: ITEMS_PER_PAGE,
        offset_count: offset
      })
    
    if (error) {
      console.error('Search function error:', error)
    }
    
    if (data && data.length > 0) {
      // Get total count from first row (same for all rows due to window function)
      totalCount = data[0].total_count || 0
      totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)
      
      results = data.map((item) => {
        if (item.result_type === 'book') {
          return {
            id: item.id,
            book_name: item.book_name!,
            created_at: item.created_at,
            resultType: 'book' as const
          }
        } else {
          return {
            id: item.id,
            song_name: item.song_name!,
            grade: item.grade,
            created_at: item.created_at,
            book_id: item.book_id,
            book_name: item.book_name,
            resultType: 'song' as const
          }
        }
      })
    }
  }

  return { results, totalCount, totalPages }
}
