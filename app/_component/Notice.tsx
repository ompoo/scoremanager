import React from 'react'
import notices from './notice.json'

type NoticeItem = { date: string; content: string; end_txt?: string }

export default function Notice({ noticeData = [] }: { noticeData?: NoticeItem[] }) {
  const allNotices = [...notices, ...noticeData];
  
  return (
    <>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">📢</span>
        <h3 className="text-2xl font-bold tracking-tight">お知らせ</h3>
      </div>
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                
        <div className="flex flex-col space-y-4 px-2 sm:px-4">
          <ul className="space-y-3">
            {allNotices.map((n, i) => (
              <li key={i} className="flex flex-col sm:flex-row sm:items-baseline gap-2 text-sm">
                <span className="font-mono text-muted-foreground shrink-0">{n.date}</span>
                <span className="text-foreground">{n.content} {n.end_txt}</span>
              </li>
            ))}
            {/* Static Content */}                                                                                                                                           
            <li className="flex flex-col sm:flex-row sm:items-baseline gap-2 text-sm">                                                                                       
              <span className="font-mono text-muted-foreground shrink-0">2025.12.13</span>                                                                                 
              <span className="text-foreground">リニューアルしました。</span>                                                                                          
            </li>                                                                                                                                                            
            <li className="flex flex-col sm:flex-row sm:items-baseline gap-2 text-sm">                                                                                       
              <span className="font-mono text-muted-foreground shrink-0">2025.12.13</span>                                                                                
              <span className="text-foreground leading-relaxed">                                                                                                           
                意外とみんな使ってくれてるみたいでありがとうございます。                                                   
                <br className="hidden sm:block" />                                                                                                                         
                デザインとかほしい機能とか募集中です。                                                                                                                     
              </span>                                                                                                                                                      
            </li> 
          </ul>
        </div>
      </div>
      </>
  )
}
