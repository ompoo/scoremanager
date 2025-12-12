import React from 'react'

type NoticeItem = { date: string; content: string; end_txt?: string }

export default function Notice({ noticeData = [] }: { noticeData?: NoticeItem[] }) {
  // Combine static data for cleaner rendering if needed, but for now just appended
  return (
    <div className="flex flex-col space-y-4 px-2 sm:px-4">
      <ul className="space-y-3">
        {noticeData.map((n, i) => (
          <li key={i} className="flex flex-col sm:flex-row sm:items-baseline gap-2 text-sm">
             <span className="font-mono text-muted-foreground shrink-0">{n.date}</span>
             <span className="text-foreground">{n.content} {n.end_txt}</span>
          </li>
        ))}
        {/* Static Content */}
        <li className="flex flex-col sm:flex-row sm:items-baseline gap-2 text-sm">
             <span className="font-mono text-muted-foreground shrink-0">2024.11.15</span>
             <span className="text-foreground">部室の本追加完了しました！</span>
        </li>
        <li className="flex flex-col sm:flex-row sm:items-baseline gap-2 text-sm">
             <span className="font-mono text-muted-foreground shrink-0">2024.11.12</span>
             <span className="text-foreground leading-relaxed">
               意外とみんな使ってくれてるみたいでありがとうございます。詳細検索、若干不具合あります。
               <br className="hidden sm:block" />
               デザインとかほしい機能とか募集中です。
             </span>
        </li>
      </ul>
    </div>
  )
}
