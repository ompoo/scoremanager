import React from 'react'
import Link from 'next/link'

type Pickup = { id: number | string; product_code: string }

export default function Pickups({ items = [] }: { items?: Pickup[] }) {
  if (items.length === 0) {
    return (
       <div className="w-full text-center py-10 text-muted-foreground bg-muted/30 rounded-xl border border-dashed border-border">
          No pickups available
       </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 w-full">
      {items.map((i) => (
        <Link 
          key={String(i.id)} 
          href={`/book/${i.id}`} 
          className="group relative block aspect-[3/4] rounded-xl bg-card border border-border shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:ring-2 hover:ring-primary/20"
        >
          <div className="absolute inset-0 p-4 flex items-center justify-center bg-white">
             <img 
               src={`https://www.ymm.co.jp/p/cover/${i.product_code}.gif`} 
               loading="lazy" 
               alt="Book Cover"
               className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" 
             />
          </div>
        </Link>
      ))}
    </div>
  )
}
