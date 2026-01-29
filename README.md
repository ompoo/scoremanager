# Ompoo Score Manager - 楽譜館

部室に所蔵している楽譜を簡単に検索できるアプリケーションです。

## 📖 使い方 (How to Use)

公開ページにアクセスし、検索バーにキーワード（曲名や本など）を入力して検索します。
ヒットしたものが部室に所蔵されている楽譜です。検索結果に何も表示されない場合は、部室にはありません。

### 主な機能
- **検索機能**: キーワードで楽譜を検索し、一覧表示します。
- **詳細ページ**: 検索結果をタップすると、その曲が収録されている楽譜集（本）の詳細ページへ移動します。
  - 同じ本に収録されている他の曲も確認できます。
  - 画像をタップすると、ヤマハの公式楽譜ページへジャンプできます。

### 💡 Tips
1. **詳細検索**: 検索欄のトグルをタップすると、詳細検索フォームが表示されます。
   - 作曲者、編曲者、難易度（グレード）などを指定して詳しく検索できます。
2. **データ購入**: 楽譜集詳細ページからヤマハの公式サイトへ飛ぶことで、レジストデータの購入ページなどへスムーズにアクセスできます。

---

## 💻 For Developers

このプロジェクトは Next.js で構築されています。

### Tech Stack

**Frontend:**
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Form Management**: TanStack Forms
- **Schema Validation**: Zod
- **URL State Management**: Nuqs

**Backend / Data Management:**
- **Database**: Supabase
- **Data Scraping**: Python 3.12+
- **Package Manager**: uv

### Getting Started

#### Frontend Development

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

#### Data Registration (Python)

楽譜データをSupabaseに登録するためのPythonスクリプトです。

**Prerequisites:**
- Python 3.12 以上
- uv (Python package manager)
- `.env.local` ファイルに Supabase の認証情報が設定されていること

**Setup & Run:**

```bash
# Python環境のセットアップ（初回のみ）
uv sync

# データ登録スクリプトの実行
uv run register
```

スクリプトは `supabase/scripts/data.txt` に記載されたヤマハ楽譜コードを読み込み、自動的にスクレイピングしてSupabaseに登録します。

**Project Structure:**
```
supabase/
  ├── scripts/
  │   ├── register_actions.py  # メイン登録スクリプト
  │   ├── data.txt              # 登録対象の楽譜コード
  │   └── generate_seed_sql.py  # シードデータ生成用
  └── migrations/               # Supabase マイグレーションファイル
```

### Development Note
開発に関する議論や連絡事項は、Ompoo Dev Discord の「楽譜館」チャンネルで行っています。