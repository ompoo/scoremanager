# Directory Structure

プロジェクトの主要なディレクトリとファイルの構成です。

```text
.
├── .gemini/             # AIアシスタント用の設定・ドキュメント
├── app/                 # Next.js App Routerのページ・レイアウト
│   ├── advancedsearch/  # 詳細検索ページ
│   ├── book/            # 本の詳細表示ページ ([id])
│   ├── searchbook/      # 本の検索ページ
│   ├── searchsong/      # 曲の検索ページ
│   ├── _component/      # ページ固有のコンポーネント
│   ├── globals.css      # グローバルCSS
│   └── page.tsx         # トップページ
├── components/          # 再利用可能なUIコンポーネント
│   ├── ExtraForms.tsx   # 追加フォームコンポーネント
│   ├── SearchBar.tsx    # 検索バー
│   └── ...
├── docs/                # プロジェクトドキュメント
├── lib/                 # ユーティリティ・ライブラリ設定
├── public/              # 静的ファイル (画像など)
├── types/               # TypeScript型定義 (Supabaseなど)
└── utils/               # ユーティリティ関数
    └── supabase/        # Supabaseクライアント設定
```
