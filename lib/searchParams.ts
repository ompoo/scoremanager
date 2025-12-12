import { 
  createSearchParamsCache, 
  parseAsString, 
  parseAsInteger 
} from 'nuqs/server'

export const searchParamsParsers = {
  // General search
  query: parseAsString.withDefault(''),
  type: parseAsString.withDefault('all'), // 'all' | 'book' | 'song'
  
  // Advanced search fields
  book: parseAsString.withDefault(''),
  song: parseAsString.withDefault(''),
  artist: parseAsString.withDefault(''),
  lyricist: parseAsString.withDefault(''),
  songWriter: parseAsString.withDefault(''),
  arranger: parseAsString.withDefault(''),
  grade: parseAsString.withDefault(''),
  memo: parseAsString.withDefault(''),
  
  // Pagination
  page: parseAsInteger.withDefault(1),
}

export const searchParamsCache = createSearchParamsCache(searchParamsParsers)
