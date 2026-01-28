# 楽譜館 データベーススキーマ設計

Supabase (PostgreSQL) で運用するためのデータベース設計書です。
元となるSQLAlchemyスキーマに基づき、リレーショナルデータベースとして正規化された構造になっています。
フロントエンドで使用する型定義については `types/supabase.ts` を参照してください（Supabaseにより自動生成されます）。

## 概要 (ER図イメージ)

- **books (楽譜集)**
  - 1冊の本には複数の曲 (`songs`) が含まれます (1対多)。
- **songs (曲)**
  - 曲は1冊の本に所属します。nullの場合もあります。
  - アーティスト、作詞家、作曲家、編曲家とは「多対多」の関係です。
- **artists / lyricists / songwriters / arrangers**
  - それぞれ独立したマスタテーブルとして管理し、中間テーブルを通じて曲と紐付きます。

---

## テーブル定義

### 1. books (楽譜集)
所蔵している楽譜本、曲集のデータです。

| カラム名 | 型 (PostgreSQL) | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | `bigint` | PK, Identity | 楽譜集ID |
| `book_name` | `text` | Not Null | 楽譜集のタイトル |
| `product_code` | `text` | Nullable | ISBNや商品コード |
| `created_at` | `timestamptz` | Default: `now()`, Not Null | 登録日時 |

### 2. songs (曲)
個々の楽曲データです。

| カラム名 | 型 (PostgreSQL) | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | `bigint` | PK, Identity | 曲ID |
| `book_id` | `bigint` | FK -> `books.id` (ON DELETE SET NULL) | 収録されている本のID |
| `song_name` | `text` | Not Null | 曲名 |
| `grade` | `text` | Nullable | 難易度・グレード (例: "5級") |
| `memo` | `text` | Nullable | 備考 |
| `created_at` | `timestamptz` | Default: `now()`, Not Null | 登録日時 |

### 3. artists (アーティスト)
演奏者やバンド名などのアーティスト情報です。

| カラム名 | 型 (PostgreSQL) | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | `bigint` | PK, Identity | アーティストID |
| `Artist_name` | `text` | Not Null | アーティスト名 |

### 4. lyricists (作詞家)

| カラム名 | 型 (PostgreSQL) | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | `bigint` | PK, Identity | 作詞家ID |
| `lyricist_name` | `text` | Not Null | 作詞家名 |

### 5. songwriters (作曲家)

| カラム名 | 型 (PostgreSQL) | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | `bigint` | PK, Identity | 作曲家ID |
| `song_writer_name`| `text` | Not Null | 作曲家名 |

### 6. arrangers (編曲家)

| カラム名 | 型 (PostgreSQL) | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | `bigint` | PK, Identity | 編曲家ID |
| `arranger_name` | `text` | Not Null | 編曲家名 |

---

## 中間テーブル (Association Tables)
多対多のリレーションシップを実現するためのテーブルです。すべて `ON DELETE CASCADE` が設定されており、親データ（曲または各マスタ）が削除されると自動的に紐付けも削除されます。

### 7. song_artist_association
曲とアーティストの紐付け。

| カラム名 | 型 | 制約 |
| :--- | :--- | :--- |
| `song_id` | `bigint` | PK, FK -> `songs.id` (Not Null) |
| `artist_id` | `bigint` | PK, FK -> `artists.id` (Not Null) |

### 8. song_lyricist_association
曲と作詞家の紐付け。

| カラム名 | 型 | 制約 |
| :--- | :--- | :--- |
| `song_id` | `bigint` | PK, FK -> `songs.id` (Not Null) |
| `lyricist_id` | `bigint` | PK, FK -> `lyricists.id` (Not Null) |

### 9. song_writer_association
曲と作曲家の紐付け。

| カラム名 | 型 | 制約 |
| :--- | :--- | :--- |
| `song_id` | `bigint` | PK, FK -> `songs.id` (Not Null) |
| `song_writer_id` | `bigint` | PK, FK -> `songwriters.id` (Not Null) |

### 10. song_arranger_association
曲と編曲家の紐付け。

| カラム名 | 型 | 制約 |
| :--- | :--- | :--- |
| `song_id` | `bigint` | PK, FK -> `songs.id` (Not Null) |
| `arranger_id` | `bigint` | PK, FK -> `arrangers.id` (Not Null) |

## 関数

### `get_random_books(limit_count int)`

`product_code` が存在する本の中から、指定された数（`limit_count`）だけランダムに本を返す関数です。大規模なテーブルでも効率的にランダム選択が行えるように、`ORDER BY random()` に依存せず、ID配列からのサンプリング方式を採用しています。

### `search_books_and_songs(search_query text DEFAULT '', limit_count int DEFAULT 10, offset_count int DEFAULT 0)`

本（`book_name`）と曲（`song_name`）の両方を対象にキーワード検索を行う関数です。
- `UNION ALL` を使用して、本と曲の検索結果を統合して返します。
- `result_type` カラムにより、結果が 'book' か 'song' かを判別可能です。
- `total_count` (Window Function `COUNT(*) OVER()`) を含み、ページネーションに対応しています。
- `created_at` の降順でソートされます。

---

## インデックス

パフォーマンス向上のため、以下のインデックスが設定されています。

| インデックス名 | テーブル | カラム | 説明 |
| :--- | :--- | :--- | :--- |
| `idx_books_name` | `books` | `book_name` | 本のタイトル検索の高速化 |
| `idx_songs_name` | `songs` | `song_name` | 曲名検索の高速化 |
| `idx_songs_book_id` | `songs` | `book_id` | 本と曲の結合（JOIN）の高速化 |
