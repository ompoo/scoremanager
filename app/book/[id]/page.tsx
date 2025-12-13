import React from 'react'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import BookCover from '../../../components/BookCover'
import Link from 'next/link'
import { Tables } from '@/types/supabase'

type SongSummary = Pick<Tables<'songs'>, 'id' | 'song_name' | 'grade'>

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const bookId = parseInt(id, 10)
  
  if (isNaN(bookId)) {
    notFound()
  }

  const supabase = await createClient()

  // Fetch book details
  const { data, error: bookError } = await supabase
    .from('books')
    .select('*')
    .eq('id', bookId)
    .single()
  
  const book = data as Tables<'books'> | null

  if (bookError || !book) {
    console.error("Book not found or error:", bookError)
    notFound()
  }

  // Fetch songs in this book (temporarily simplified query for debugging)
  const selectFields = [
    'id',
    'song_name',
    'grade'
  ];

  const { data: songsData, error: songsError } = await supabase
    .from('songs')
    .select(selectFields.join(', ')) // Dynamically build select string
    .eq('book_id', bookId)
    .order('id') // Or order by track number if available

  const songs = songsData as SongSummary[] | null

  if (songsError) {
    console.error("Error fetching songs for book:", songsError)
  }

  // YAMAHA Cover Image Logic
  const coverUrl = book.product_code 
    ? `https://www.ymm.co.jp/p/cover/${book.product_code}.gif`
    : '/file.png'

  return (
    <main className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      
      <div className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 space-y-12">
        {/* Book Header */}
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div className="w-full md:w-1/3 max-w-[300px] aspect-[3/4] relative bg-muted rounded-lg overflow-hidden shadow-md flex-shrink-0">
             <BookCover 
               src={coverUrl} 
               alt={book.book_name} 
               className="w-full h-full object-contain p-2"
               fallbackSrc="/file.png"
             />
          </div>
          
          <div className="flex-1 space-y-6 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{book.book_name}</h1>
            
            <div className="space-y-2 text-muted-foreground">
              {book.product_code && <p className="font-mono text-sm">Product Code: {book.product_code}</p>}
              <p className="text-sm">Added: {new Date(book.created_at).toLocaleDateString('ja-JP')}</p>
            </div>

            {book.product_code && (
               <a 
                 href={`https://www.ymm.co.jp/p/detail.php?code=${book.product_code}`}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-sm"
               >
                 <span>ヤマハ公式サイトで見る</span>
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                 </svg>
               </a>
            )}
          </div>
        </div>

        {/* Songs List */}
        <section className="space-y-6">
           <h2 className="text-2xl font-bold border-b border-border pb-2">収録曲一覧 ({songs?.length || 0})</h2>
           
           <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
             <div className="overflow-x-auto">
               <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-muted text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-medium">Song Name</th>
                    {/* Simplified for debugging */}
                    <th className="px-6 py-4 font-medium">Grade</th> 
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {songs && songs.length > 0 ? (
                    songs.map((song) => (
                      <tr key={song.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground">{song.song_name}</td>
                        <td className="px-6 py-4 text-muted-foreground">{song.grade || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="px-6 py-12 text-center text-muted-foreground">
                        収録曲情報がありません。
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  )
}
