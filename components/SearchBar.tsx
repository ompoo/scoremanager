"use client"
import React from 'react'

export default function SearchBar({ value = '', name = 'query' }: { value?: string; name?: string }) {
  return (
    <div className="max-w-[400px] mx-auto relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/0 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <input 
        type="text" 
        id="query" 
        name={name} 
        placeholder="Search for ..." 
        defaultValue={value} 
        className="relative w-full rounded-full bg-background border border-border text-foreground placeholder:text-muted-foreground py-3 pl-5 pr-12 text-sm shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-primary/50" 
      />
      <span className="absolute inset-y-0 right-1 flex items-center">
        <button 
          className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-muted transition-colors" 
          aria-label="Search"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </button>
      </span>
    </div>
  )
}
