"use client"
import React from 'react'

type Props = {
  small?: boolean
}

export default function Header({ small }: Props) {
  const containerClass = small ? 'h-[30vh] max-h-32 sm:max-h-[20vh]' : 'h-16'
  return (
    <div className={`relative w-full mx-auto ${containerClass} overflow-hidden`}>
      <img src="/back_left.jpg" alt="left" className="max-w-[30%] max-h-[200%] absolute top-0 left-0" />
      <div className="absolute inset-0 flex items-center mx-3 z-10">
        <h2 className="flex items-center">
          <a href="/">
            <img className="w-[36px]" src="/logo.jpg" alt="logo" />
          </a>
          <h1 className="text-2xl mx-3 lg:mx-7 font-bold">TUAT electone</h1>
          <span className="text-2xl font-bold">音風</span>
        </h2>
      </div>
      <img src="/back_right.jpg" alt="right" className="max-w-[30%] max-h-[130%] sm:max-h-[200%] absolute top-3 right-3 z-0" />
    </div>
  )
}
