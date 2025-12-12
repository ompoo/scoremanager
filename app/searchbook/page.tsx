import React from 'react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import SearchBar from '../../components/SearchBar'
import Pagination from '../../components/Pagination'

export default function SearchBook({ searchParams }: { searchParams?: any }) {
  const que = searchParams?.query || ''
  const books: any[] = []
  const page = Number(searchParams?.page || 1)
  
  return (
    <main className="min-h-screen flex flex-col bg-background text-foreground">
      <Header small />
      
      <div className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">本の検索</h1>
          <p className="text-muted-foreground">蔵書の中から本を探せます</p>
        </div>

        <form method="get" action="/searchbook" className="max-w-xl mx-auto w-full">
          <SearchBar value={que} />
        </form>

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
                {books.length > 0 ? (
                  books.map((book: any) => (
                    <tr key={book.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        <a href={`/book/${book.id}`} className="font-medium text-primary hover:underline underline-offset-4">
                          {book.book_name}
                        </a>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                        {book.created_at}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="px-6 py-12 text-center text-muted-foreground">
                      No books found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Pagination currentPage={page} totalPages={1} hasPrev={false} hasNext={false} endpoint="/searchbook" query={{ query: que }} />
      </div>

      <Footer />
    </main>
  )
}
