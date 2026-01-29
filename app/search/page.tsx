import Header from '../../components/Header'
import Footer from '../../components/Footer'
import SearchBar from '../../components/SearchBar'
import { searchParamsCache } from '@/lib/searchParams'
import Link from 'next/link'
import SearchTypeFilter from '../../components/SearchTypeFilter'
import Pagination from '../../components/Pagination'
import { searchBooksAndSongs } from '@/lib/getdataFromSupabase'

export default async function SearchPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const searchParams = await props.searchParams
  const { query, type, page } = searchParamsCache.parse(searchParams)

  // Type narrowing for overloaded function
  let results, totalCount, totalPages
  if (type === 'book') {
    ({ results, totalCount, totalPages } = await searchBooksAndSongs(query, 'book', page))
  } else if (type === 'song') {
    ({ results, totalCount, totalPages } = await searchBooksAndSongs(query, 'song', page))
  } else {
    ({ results, totalCount, totalPages } = await searchBooksAndSongs(query, 'all', page))
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

        <div className="space-y-6">
          <SearchTypeFilter />
          
          <div className="space-y-4">
            {results.length > 0 ? (
              results.map((item) => {
                const itemType = 'result_type' in item ? item.result_type : type
                return (
                <div 
                  key={`${itemType}-${item.id}`} 
                  className="group relative flex flex-row gap-3 p-3 sm:p-4 rounded-xl border border-border bg-card shadow-xs transition-all duration-200 hover:shadow-md hover:border-primary/20"
                >
                  {/* Icon Column */}
                  <div className="shrink-0">
                     <div className={`p-2 sm:p-3 rounded-full ${
                       itemType === 'book' 
                         ? 'bg-blue-100/50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                         : 'bg-green-100/50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                     }`}>
                       {itemType === 'book' ? (
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-6 sm:h-6">
                           <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                           <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                         </svg>
                       ) : (
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-6 sm:h-6">
                           <path d="M9 18V5l12-2v13"/>
                           <circle cx="6" cy="18" r="3"/>
                           <circle cx="18" cy="16" r="3"/>
                         </svg>
                       )}
                     </div>
                  </div>

                  {/* Content Column */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-2">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className={`font-medium px-2 py-0.5 rounded-full shrink-0 ${
                             itemType === 'book'
                               ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                               : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                          }`}>
                            {itemType === 'book' ? 'Book' : 'Song'}
                          </span>
                          {/* Song Specific Info - Inline */}
                          {itemType === 'song' && (
                            <div className="flex items-center gap-2 text-muted-foreground min-w-0 truncate">
                              {'grade' in item && item.grade && (
                                <span className="flex items-center gap-1 shrink-0">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                  </svg>
                                  Grade {item.grade}
                                </span>
                              )}
                              {'book_name' in item && item.book_name && (
                                <span className="flex items-center gap-1 min-w-0 truncate">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                                    <path d="m16 6 4 14"/>
                                    <path d="M12 6v14"/>
                                    <path d="M8 8v12"/>
                                    <path d="M4 4v16"/>
                                  </svg>
                                  <span className="truncate">{item.book_name}</span>
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold leading-tight group-hover:text-primary transition-colors truncate">
                          <Link href={itemType === 'book' ? `/book/${item.id}` : ('book_id' in item && item.book_id ? `/book/${item.book_id}` : '#')} className="focus:outline-hidden before:absolute before:inset-0">
                            {itemType === 'book' ? ('book_name' in item ? item.book_name : '') : ('song_name' in item ? item.song_name : '')}
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
              )})
            ) : (
              <div className="text-center py-20 bg-muted/10 rounded-2xl border-2 border-dashed border-border">
                <p className="text-muted-foreground text-lg">条件に一致する結果は見つかりませんでした。</p>
                <p className="text-sm text-muted-foreground/60 mt-1">検索ワードを変えて再度お試しください。</p>
              </div>
            )}
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