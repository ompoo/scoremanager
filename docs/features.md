# Features & Pages

アプリケーションの主要な機能とページ構成です。

## 検索機能
- **曲検索 (Search Song)**
    - パス: `/searchsong`
    - 楽曲名などを条件に検索を行う機能と思われます。
- **本検索 (Search Book)**
    - パス: `/searchbook`
    - 楽譜（本）自体を検索する機能と思われます。
- **詳細検索 (Advanced Search)**
    - パス: `/advancedsearch`
    - 複数の条件を組み合わせた高度な検索機能を提供します。

## 詳細表示
- **本の詳細 (Book Detail)**
    - パス: `/book/[id]`
    - 特定の楽譜（本）の詳細情報を表示します。

## UIコンポーネント
`components/` ディレクトリに含まれる主要な機能部品：
- **SearchBar**: 検索入力用バー
- **Pagination**: ページネーション制御
- **Pickups**: おすすめやピックアップ表示（推測）
- **ExtraSearch/ExtraForms**: 追加の検索オプションやフォーム
