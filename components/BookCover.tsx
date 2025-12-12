"use client"
import React, { useState } from 'react'

type Props = {
  src: string
  alt: string
  className?: string
  fallbackSrc?: string
}

export default function BookCover({ src, alt, className, fallbackSrc = '/no-image.png' }: Props) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  return (
    <img 
      src={hasError ? fallbackSrc : imgSrc} 
      alt={alt} 
      className={className}
      onError={() => {
        setHasError(true)
        setImgSrc(fallbackSrc)
      }}
    />
  )
}
