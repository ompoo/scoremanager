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

  const { results, totalCount, totalPages } = await searchBooksAndSongs(query, type, page)

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
              results.map((item) => (
                <div 
                  key={`${item.resultType}-${item.id}`} 
                  className="group relative flex flex-col sm:flex-row gap-4 p-4 sm:p-5 rounded-xl border border-border bg-card shadow-xs transition-all duration-200 hover:shadow-md hover:border-primary/20"
                >
                  {/* Icon Column */}
                  <div className="shrink-0 flex sm:block">
                     <div className={`p-3 rounded-full ${
                       item.resultType === 'book' 
                         ? 'bg-blue-100/50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                         : 'bg-green-100/50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                     }`}>
                       {item.resultType === 'book' ? (
                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                           <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                           <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                         </svg>
                       ) : (
                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                           <path d="M9 18V5l12-2v13"/>
                           <circle cx="6" cy="18" r="3"/>
                           <circle cx="18" cy="16" r="3"/>
                         </svg>
                       )}
                     </div>
                  </div>

                  {/* Content Column */}
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                             item.resultType === 'book'
                               ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                               : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                          }`}>
                            {item.resultType === 'book' ? 'Book' : 'Song'}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                              <line x1="16" x2="16" y1="2" y2="6"/>
                              <line x1="8" x2="8" y1="2" y2="6"/>
                              <line x1="3" x2="21" y1="10" y2="10"/>
                            </svg>
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold leading-tight group-hover:text-primary transition-colors">
                          <Link href={item.resultType === 'book' ? `/book/${item.id}` : (item.book_id ? `/book/${item.book_id}` : '#')} className="focus:outline-hidden before:absolute before:inset-0">
                            {item.resultType === 'book' ? item.book_name : item.song_name}
                          </Link>
                        </h3>
                      </div>
                    </div>
                    
                    {/* Song Specific Info */}
                    {item.resultType === 'song' && (
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        {item.grade && (
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 border border-border/50">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                            <span>Grade: {item.grade}</span>
                          </div>
                        )}
                         {item.book_name && (
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 border border-border/50">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="m16 6 4 14"/>
                                  <path d="M12 6v14"/>
                                  <path d="M8 8v12"/>
                                  <path d="M4 4v16"/>
                                </svg>
                                <span className="truncate max-w-[200px]">収録: {item.book_name}</span>
                            </div>
                        )}
                      </div>
                    )}

                    {/* Matched Songs for Book */}
                    {item.resultType === 'book' && item.matchedSongs && item.matchedSongs.length > 0 && (
                       <div className="mt-3 pt-3 border-t border-border/50">
                          <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M9 18V5l12-2v13"/>
                              <circle cx="6" cy="18" r="3"/>
                              <circle cx="18" cy="16" r="3"/>
                            </svg>
                            ヒットした曲:
                          </p>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {item.matchedSongs.map(song => (
                               <div key={song.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-sm">
                                  <span className="font-medium truncate">{song.song_name}</span>
                                  {song.grade && <span className="text-xs text-muted-foreground border border-border px-1.5 rounded">{song.grade}</span>}
                               </div>
                            ))}
                          </div>
                       </div>
                    )}
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