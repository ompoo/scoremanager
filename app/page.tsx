import React from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import Notice from './components/Notice'
import Pickups from './components/Pickups'
import SearchBar from './components/SearchBar'
import ExtraSearch from './components/ExtraSearch'

export default function Home() {
  return (
    <main className="w-full min-h-screen flex flex-col">
      <header className="w-full flex-none">
        <Header small />
      </header>

      <main className="w-full px-3 py-5 grow">
        <p className="text-center text-2xl my-10 sm:my-0 break-keep">音風　楽譜館へようこそ。<br />ここでは<wbr />部室所蔵の楽譜を<wbr />検索できます。</p>

        <h1 className="text-center text-2xl font-extrabold p-5">本の検索</h1>
        <form method="get" action="/searchbook"><SearchBar /></form>

        <h1 className="text-center text-2xl font-extrabold p-5">曲の検索</h1>
        <form method="get" action="/searchsong"><SearchBar /></form>

        <ExtraSearch />

        <h1 className="text-center text-2xl font-extrabold pt-5 pb-3 mt-10">お知らせ</h1>
        <Notice noticeData={[]} />

        <h1 className="text-center text-2xl font-extrabold py-3 mt-10">pick up</h1>
        <Pickups items={[]} />
      </main>

      <footer className="w-full flex-none mt-5">
        <Footer />
      </footer>
    </main>
  )
}
