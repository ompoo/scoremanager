"use client"
import React from 'react'
import ExtraForms from './ExtraForms'

export default function ExtraSearch() {
  return (
    <details className="w-fit mx-auto">
      <summary className="text-center text-xl font-extrabold px-5 pt-5 pb-3">詳細検索</summary>
      <p className="text-center">開発中<br />完全一致、and検索です　スペルには気をつけてください<br />ヒットしない場合、英語にしたりカタカナにしたりしてください</p>
      <form action="/advancedsearch" method="get" className=" mx-auto text-center max-w-[350px]">
        <ExtraForms />
        <button type="submit" className="py-1 px-5  mt-5 me-2 mb-2 text-sm text-gray-900 bg-white rounded-full border border-gray-200">search</button>
      </form>
    </details>
  )
}
