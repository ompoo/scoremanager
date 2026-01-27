import { 
  createSearchParamsCache, 
  parseAsString, 
  parseAsInteger,
  parseAsStringLiteral
} from 'nuqs/server'

export const searchParamsParsers = {
  // General search
  query: parseAsString.withDefault(''),
  type: parseAsStringLiteral(['all', 'book', 'song'] as const).withDefault('all'),
  
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
