import React from 'react'

type NoticeItem = { date: string; content: string; end_txt?: string }

export default function Notice({ noticeData = [] }: { noticeData?: NoticeItem[] }) {
  return (
    <div className="px-12 text-sm text-center flex-col space-y-2">
      {noticeData.map((n, i) => (
        <p key={i}>{n.date} {n.content} {n.end_txt}</p>
      ))}
      <p>2024.11.15 部室の本追加完了しました！</p>
      <p className="break-keep">2024.11.12 意外とみんな使ってくれてるみたいで<wbr />ありがとうございます。詳細検索、若干不具合あります。<br />デザインとかほしい機能とか募集中です。</p>
    </div>
  )
}
