# 楽譜館 データベーススキーマ設計

Supabase (PostgreSQL) で運用するためのデータベース設計書です。
元となるSQLAlchemyスキーマに基づき、リレーショナルデータベースとして正規化された構造になっています。

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
| `book_name` | `text` | | 楽譜集のタイトル |
| `product_code` | `text` | Nullable | ISBNや商品コード |
| `created_at` | `timestamptz` | Default: `now()` | 登録日時 |

### 2. songs (曲)
個々の楽曲データです。

| カラム名 | 型 (PostgreSQL) | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | `bigint` | PK, Identity | 曲ID |
| `book_id` | `bigint` | FK -> `books.id` Nullable | 収録されている本のID |
| `song_name` | `text` | Not Null | 曲名 |
| `grade` | `text` | Nullable | 難易度・グレード (例: "5級") |
| `memo` | `text` | Nullable | 備考 |
| `created_at` | `timestamptz` | Default: `now()` | 登録日時 |

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
多対多のリレーションシップを実現するためのテーブルです。

### 7. song_artist_association
曲とアーティストの紐付け。

| カラム名 | 型 | 制約 |
| :--- | :--- | :--- |
| `song_id` | `bigint` | PK, FK -> `songs.id` |
| `artist_id` | `bigint` | PK, FK -> `artists.id` |

### 8. song_lyricist_association
曲と作詞家の紐付け。

| カラム名 | 型 | 制約 |
| :--- | :--- | :--- |
| `song_id` | `bigint` | PK, FK -> `songs.id` |
| `lyricist_id` | `bigint` | PK, FK -> `lyricists.id` |

### 9. song_writer_association
曲と作曲家の紐付け。

| カラム名 | 型 | 制約 |
| :--- | :--- | :--- |
| `song_id` | `bigint` | PK, FK -> `songs.id` |
| `song_writer_id` | `bigint` | PK, FK -> `songwriters.id` |

### 10. song_arranger_association
曲と編曲家の紐付け。

| カラム名 | 型 | 制約 |
| :--- | :--- | :--- |
| `song_id` | `bigint` | PK, FK -> `songs.id` |
| `arranger_id` | `bigint` | PK, FK -> `arrangers.id` |
