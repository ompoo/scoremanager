import React from 'react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import SearchBar from '../../components/SearchBar'
import Pagination from '../../components/Pagination'
import { searchParamsCache } from '@/lib/searchParams'
import { createClient } from '@/utils/supabase/server'
import { Tables } from '@/types/supabase'

const ITEMS_PER_PAGE = 10;

type Book = Pick<Tables<'books'>, 'id' | 'book_name' | 'created_at'>

export default async function SearchBook({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { query, page } = searchParamsCache.parse(await searchParams)

  const supabase = await createClient() // Make this await as createClient is async

  // Fetch total count for pagination
  let countQuery = supabase.from('books').select('*', { count: 'exact', head: true })
  if (query) {
    countQuery = countQuery.ilike('book_name', `%${query}%`)
  }
  const { count, error: countError } = await countQuery

  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 0;
  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  // Fetch books for the current page
  let booksQuery = supabase.from('books').select('id, book_name, created_at')
  if (query) {
    booksQuery = booksQuery.ilike('book_name', `%${query}%`)
  }
  const { data, error } = await booksQuery.range(from, to)

  const books = data as Book[] | null
  
  if (countError || error) {
    console.error('Error fetching books:', countError || error)
    // In a real app, you might want to display an error message to the user
    return (
      <main className="min-h-screen flex flex-col bg-background text-foreground">
        <Header small />
        <div className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 space-y-8 text-center text-destructive">
          <p>本の取得中にエラーが発生しました。</p>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col bg-background text-foreground">
      <Header small />
      
      <div className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">本の検索</h1>
          <p className="text-muted-foreground">蔵書の中から本を探せます</p>
        </div>

        <div className="max-w-xl mx-auto w-full">
          <SearchBar />
        </div>

        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Book Name</th>
                  <th className="px-6 py-4 w-[150px] font-medium">Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {books && books.length > 0 ? (
                  books.map((book) => (
                    <tr key={book.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        <a href={`/book/${book.id}`} className="font-medium text-primary hover:underline underline-offset-4">
                          {book.book_name}
                        </a>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                        {book.created_at ? new Date(book.created_at).toLocaleDateString('ja-JP') : '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="px-6 py-12 text-center text-muted-foreground">
                      {query ? '検索条件に一致する本は見つかりませんでした。' : '本が登録されていません。'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Pagination currentPage={page} totalPages={totalPages} hasPrev={page > 1} hasNext={page < totalPages} endpoint="/searchbook" query={{ query }} />
      </div>

      <Footer />
    </main>
  )
}
