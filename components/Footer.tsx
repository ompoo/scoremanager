import React from 'react'

export default function Footer() {
  return (
    <footer className="w-full mt-auto py-8 border-t border-border bg-muted/30">
      <div className="max-w-5xl mx-auto px-4 flex flex-col items-center gap-4 text-center">
        
        <div className="inline-flex items-center justify-center gap-3">
          <img src="/logo.jpg" alt="Logo" className="h-8 w-8 rounded-full object-cover ring-1 ring-border" />
          <a 
            href="https://sites.google.com/view/electone-ompoo/%E3%83%9B%E3%83%BC%E3%83%A0" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-lg font-bold text-foreground hover:text-primary transition-colors"
          >
            TUAT electone 音風
          </a>
          <img src="/file.png" alt="Icon" className="h-6 w-auto opacity-80" />
        </div>
        
        <div className="text-sm text-muted-foreground space-y-1">
          <p>Last update: 2025.03.09</p>
          <p className="text-xs">Developed by Horisan 24gen</p>
        </div>
      </div>
    </footer>
  )
}
