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
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Form Management**: TanStack Forms
- **Schema Validation**: Zod
- **URL State Management**: Nuqs

### Getting Started

ローカル環境での立ち上げ方です。

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Development Note
開発に関する議論や連絡事項は、Ompoo Dev Discord の「楽譜館」チャンネルで行っています。