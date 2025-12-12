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
    <div className="mx-auto w-full">
      <header><Header /></header>
      <h1 className="text-center text-2xl font-bold mb-3">本の検索</h1>
      <form method="get" action="/searchbook"><SearchBar value={que} /></form>

      <table className="w-full border-collapse table-fixed bg-white object-center text-left text-sm mt-5 text-gray-800">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4">book name</th>
            <th className="px-6 py-4 w-[125px]">added</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 border-t border-gray-100">
          {books.map((book: any) => (
            <tr key={book.id} className="hover:bg-gray-50">
              <th className="px-6 py-4 text-blue-800 hover:underline"><a href={`/book/${book.id}`}>{book.book_name}</a></th>
              <td className="px-6 py-4 whitespace-nowrap">{book.created_at}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination currentPage={page} totalPages={1} hasPrev={false} hasNext={false} endpoint="/searchbook" query={{ query: que }} />
      <Footer />
    </div>
  )
}
