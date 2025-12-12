"use client"
import React from 'react'

export default function SearchBar({ value = '', name = 'query' }: { value?: string; name?: string }) {
  return (
    <div className="max-w-[350px] mx-auto relative">
      <input type="text" id="query" name={name} placeholder="Search for ..." defaultValue={value} className="w-full rounded-lg bg-gray-50 border border-gray-300 text-gray-900 py-2.5 pe-10 ps-1 sm:text-sm" />
      <span className="absolute inset-y-0 end-0 grid w-10 place-content-center">
        <button className="text-gray-600 hover:text-gray-700" aria-label="Search">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </button>
      </span>
    </div>
  )
}
