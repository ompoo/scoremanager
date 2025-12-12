import React from 'react'

type Pickup = { id: number | string; product_code: string }

export default function Pickups({ items = [] }: { items?: Pickup[] }) {
  return (
    <div className="flex flex-row space-x-2 lg:space-x-10 items-center w-full max-w-screen-xl mx-auto h-fit">
      {items.map((i) => (
        <div key={String(i.id)} className="rounded-lg flex-1 bg-gray-100 shadow-lg h-[15vh] lg:h-[25vh] p-1 lg:p-3">
          <a href={`/book/${i.id}`} className="h-full flex items-center justify-center">
            <img src={`https://www.ymm.co.jp/p/cover/${i.product_code}.gif`} loading="lazy" className="object-contain h-full w-full" />
          </a>
        </div>
      ))}
    </div>
  )
}
