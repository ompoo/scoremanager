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

const ITEMS_PER_PAGE = 20



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
    const { data, count, error } = await queryBuilder
    if (error) throw error
    
    return { data, count }
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

export type SongSummary = Pick<Tables<'songs'>, 'id' | 'song_name' | 'grade' | 'memo'> & {
  song_writer_association: {
    songwriters: Pick<Tables<'songwriters'>, 'song_writer_name'> | null
  }[]
  song_arranger_association: {
    arrangers: Pick<Tables<'arrangers'>, 'arranger_name'> | null
  }[]
  song_lyricist_association: {
    lyricists: Pick<Tables<'lyricists'>, 'lyricist_name'> | null
  }[]
  song_artist_association: {
    artists: Pick<Tables<'artists'>, 'Artist_name'> | null
  }[]
}

export async function getSongsByBookId(bookId: number): Promise<SongSummary[] | null> {
  const supabase = await createClient()
  
  const { data: songsData, error: songsError } = await supabase
    .from('songs')
    .select(`
      id,
      song_name,
      grade,
      memo,
      song_writer_association (
        songwriters (
          song_writer_name
        )
      ),
      song_arranger_association (
        arrangers (
          arranger_name
        )
      ),
      song_lyricist_association (
        lyricists (
          lyricist_name
        )
      ),
      song_artist_association (
        artists (
          Artist_name
        )
      )
    `)
    .eq('book_id', bookId)
    .order('id')

  if (songsError) {
    console.error("Error fetching songs for book:", songsError)
    return null
  }

  return songsData as SongSummary[]
}

// Advanced search types
export type AdvancedSearchParams = {
  book?: string
  song?: string
  artist?: string
  lyricist?: string
  songWriter?: string
  arranger?: string
  grade?: string
  memo?: string
  page: number
}

export type SongWithDetails = Pick<Tables<'songs'>, 'id' | 'song_name' | 'grade' | 'memo' | 'book_id'> & {
  books: Pick<Tables<'books'>, 'id' | 'book_name'> | null;
  artists: Pick<Tables<'artists'>, 'Artist_name'>[] | null;
  lyricists: Pick<Tables<'lyricists'>, 'lyricist_name'>[] | null;
  songwriters: Pick<Tables<'songwriters'>, 'song_writer_name'>[] | null;
  arrangers: Pick<Tables<'arrangers'>, 'arranger_name'>[] | null;
}

export async function advancedSearchSongs(
  params: AdvancedSearchParams
): Promise<{ songs: SongWithDetails[] | null; totalCount: number; totalPages: number; error: Error | null }> {
  const supabase = await createClient()
  
  const { book, song, artist, lyricist, songWriter, arranger, grade, memo, page } = params

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
  const totalCount = count || 0
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  return { 
    songs, 
    totalCount, 
    totalPages, 
    error: error as Error | null 
  }
}
