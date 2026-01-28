import { createClient } from '@/utils/supabase/server'
import { Tables } from '@/types/supabase'
import { SupabaseClient } from '@supabase/supabase-js'
import { SearchType } from './searchParams'

type FetchBooksResult = Pick<Tables<'books'>, 'id' | 'book_name' | 'created_at'> 

type FetchSongsResult = Pick<Tables<'songs'>, 'id' | 'song_name' | 'grade' | 'created_at' | 'book_id'> & { 
  book_name: string | null
}

type FetchAllResult = {
  result_type: 'book' | 'song'
  total_count: number
} & (
  | { result_type: 'book'; } & FetchBooksResult
  | { result_type: 'song'; } & FetchSongsResult
)

export type SearchResultItem = FetchAllResult

const ITEMS_PER_PAGE = 10



  // Helper to fetch books
const fetchBooks = async (supabase: SupabaseClient, query: string, offset: number): Promise<{ data: FetchBooksResult[] | null; count: number | null }> => {
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
const fetchSongs = async (supabase: SupabaseClient, query: string, offset: number): Promise<{ data: FetchSongsResult[] | null; count: number | null }> => {
    let queryBuilder = supabase
      .from('songs')
      .select('id, song_name, grade, created_at, book_id,...books(book_name)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + ITEMS_PER_PAGE - 1)

    if (query) {
      queryBuilder = queryBuilder.ilike('song_name', `%${query}%`)
    }

    const { data, count, error } = await queryBuilder
    if (error) throw error
    console.log(data);
    
    return { data, count }
}


// Function overloads for type-safe search results
export async function searchBooksAndSongs(
  query: string,
  type: 'book',
  page: number
): Promise<{ results: FetchBooksResult[]; totalCount: number; totalPages: number }>

export async function searchBooksAndSongs(
  query: string,
  type: 'song',
  page: number
): Promise<{ results: FetchSongsResult[]; totalCount: number; totalPages: number }>

export async function searchBooksAndSongs(
  query: string,
  type: 'all',
  page: number
): Promise<{ results: FetchAllResult[]; totalCount: number; totalPages: number }>



// Implementation
export async function searchBooksAndSongs(
  query: string,
  type: SearchType,
  page: number
): Promise<{ results: FetchBooksResult[] | FetchSongsResult[] | FetchAllResult[]; totalCount: number; totalPages: number }> {
  const offset = (page - 1) * ITEMS_PER_PAGE
  const supabase = await createClient()
  
  let results: FetchAllResult[] = []
  let totalCount = 0
  let totalPages = 0

  
  // book search
  if (type === 'book') {
    const { data, count } = await fetchBooks(supabase, query, offset)
    if (data) {
      results = data  as FetchAllResult[]
    }
    totalCount = count || 0
    totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

　// song search
  } else if (type === 'song') {
    const { data, count } = await fetchSongs(supabase, query, offset)
    if (data) {
      results = data as FetchAllResult[]
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
      
      results = data as FetchAllResult[]
    }
  }

  return { results, totalCount, totalPages }
}
