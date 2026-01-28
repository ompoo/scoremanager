# 型安全性とデータ構造の統一：検索機能のリファクタリング

## 概要

本ドキュメントでは、Score Managerの検索機能における型安全性の向上とデータ構造の統一化について、技術的な背景、遭遇した問題、実装した解決策を詳細に記録します。

## 目次

1. [背景：なぜリファクタリングが必要だったのか](#背景なぜリファクタリングが必要だったのか)
2. [Supabase型システムの制限](#supabase型システムの制限)
3. [型安全な検索実装](#型安全な検索実装)
4. [データ構造の統一化](#データ構造の統一化)
5. [将来のキャッシュ戦略](#将来のキャッシュ戦略)
6. [学んだ教訓](#学んだ教訓)

---

## 背景：なぜリファクタリングが必要だったのか

本プロジェクトでは、楽譜管理システムにおいて「本」と「曲」の検索機能を実装しています。ユーザーは検索タイプ（`all` / `book` / `song`）を切り替えて検索でき、将来的には**キャッシュ機能**を追加して高速な検索体験を提供する予定です。

### データベーススキーマ

```sql
-- books テーブル
CREATE TABLE books (
  id BIGINT PRIMARY KEY,
  book_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- songs テーブル
CREATE TABLE songs (
  id BIGINT PRIMARY KEY,
  song_name TEXT NOT NULL,
  grade TEXT,
  book_id BIGINT REFERENCES books(id),  -- Foreign Key
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 設計上の課題

このシステムを実装する上で、以下の課題に直面しました：

1. **Supabaseの型システムの制限**
   - Foreign keyが実行時は単一オブジェクトなのに、型推論では配列になる
   - 型安全性を保ちながら実際の動作を反映する必要がある

2. **複数のデータ取得方法**
   - PostgRESTの`.select()`（ネスト構造）
   - RPC関数（フラット構造）
   - 異なるデータ構造をUI層でどう扱うか

3. **将来のキャッシュ実装を見据えた設計**
   - 元々は`searchBooks`、`searchSongs`、`searchAll`という別々の関数を想定
   - しかしキャッシュ戦略を考えると、**一つの関数で管理する方が有利**
   - 型安全性を保ちながら統一的なインターフェースが必要

これらの課題を解決するため、段階的なリファクタリングを実施しました。

---

## Supabase型システムの制限

### 問題：Foreign Keyの型推論

Supabaseの型生成システムは、PostgreSQLのメタデータから型を自動生成しますが、重要な制限があります。

#### 実際のリレーションシップ vs 型推論

**実際のリレーションシップ**：
- `songs.book_id → books.id` は **0-or-1** の関係（many-to-one）
- 1つの曲は最大1冊の本に属する

**Supabaseの型推論**：
```typescript
// Supabaseが生成する型
type Song = {
  id: number
  song_name: string
  book_id: number | null
  books: { book_name: string }[]  // ❌ 配列として推論される！
}
```

**なぜこうなるのか**：
- PostgreSQLの`information_schema`はカーディナリティ情報を含まない
- Supabaseは保守的に「1対多かもしれない」と仮定
- したがって、常に配列型として推論する

**実行時の実際の動作**：
```typescript
// books!left(book_name) を使用した場合の実際の返却値
{
  id: 1,
  song_name: "曲名",
  books: { book_name: "本名" }  // ✅ 実際は単一オブジェクト
}

// book_idがnullの場合
{
  id: 2,
  song_name: "収録本なし",
  books: null  // ✅ nullになる（LEFT JOIN のため）
}
```

### 解決策：フラット構造の採用

ネスト構造での型アサーションを避けるため、**フラット構造**を採用しました：

```typescript
type FetchSongsResult = Pick<Tables<'songs'>, 'id' | 'song_name' | 'grade' | 'created_at' | 'book_id'> & { 
  book_name: string | null  // ✅ フラット構造：型アサーション不要
}

const fetchSongs = async (...): Promise<{ data: FetchSongsResult[] | null; count: number | null }> => {
  let queryBuilder = supabase
    .from('songs')
    .select('id, song_name, grade, created_at, book_id, ...books(book_name)', { count: 'exact' })
    //                                                    ^^^ スプレッド構文
  
  const { data, count, error } = await queryBuilder
  if (error) throw error
  
  return { data, count }  // ✅ 型アサーション不要
}
```

**フラット構造の利点**：
- **型アサーションが不要**：Supabaseが返す型とそのまま一致
- **シンプルな型定義**：ネストがないため理解しやすい
- **保守性の向上**：複雑な型操作が不要

---

## 型安全な検索実装

### 設計上の要件

検索機能には以下の要件がありました：

1. **検索タイプごとに異なる戻り値型**
   - `type='book'` → 本の配列
   - `type='song'` → 曲の配列（収録本情報を含む）
   - `type='all'` → 本と曲の混在配列（判別可能な形式）

2. **将来のキャッシュ実装を見据えた設計**
   - 元々は`searchBooks`、`searchSongs`、`searchAll`という別々の関数を想定
   - しかしキャッシュロジック（保存・取得・フィルタリング）を一箇所に集約したい
   - 別々の関数だとキャッシュ管理が3箇所に分散し、保守性が低下する

3. **型安全性の確保**
   - 呼び出し側で型が正確に推論される
   - コンパイル時に型エラーを検出できる

### 関数オーバーロードの採用

検索タイプによって異なる戻り値型を持つため、TypeScriptの関数オーバーロードを使用：

```typescript
// オーバーロード署名（3つ）
export async function searchBooksAndSongs(
  query: string,
  type: 'book',
  page: number
): Promise<{ results: FetchBooksResult[]; totalCount: number; totalPages: number }>

export async function searchBooksAndSongs(
  query: string,
  type: 'song',
  page: number
): Promise<{ results: FetchSongsResult[]; totalCount: number; totalPages: number }>

export async function searchBooksAndSongs(
  query: string,
  type: 'all',
  page: number
): Promise<{ results: FetchAllResult[]; totalCount: number; totalPages: number }>

// 実装署名
export async function searchBooksAndSongs(
  query: string,
  type: SearchType,
  page: number
): Promise<{ 
  results: FetchBooksResult[] | FetchSongsResult[] | FetchAllResult[]; 
  totalCount: number; 
  totalPages: number 
}> {
  // 実装
}
```

### なぜ関数オーバーロードか？

TypeScriptで型安全な検索を実装する方法はいくつか考えられます：

```typescript
// Option 1: 別々の関数
export async function searchBooks(query: string, page: number): Promise<...>
export async function searchSongs(query: string, page: number): Promise<...>
export async function searchAll(query: string, page: number): Promise<...>

// Option 2: ジェネリクス + Conditional Types
export async function searchBooksAndSongs<T extends SearchType>(
  query: string,
  type: T,
  page: number
): Promise<{
  results: T extends 'book' ? FetchBooksResult[] 
          : T extends 'song' ? FetchSongsResult[] 
          : FetchAllResult[];
  totalCount: number;
  totalPages: number;
}>

// Option 3: 関数オーバーロード（採用）
export async function searchBooksAndSongs(query: string, type: 'book', page: number): Promise<...>
export async function searchBooksAndSongs(query: string, type: 'song', page: number): Promise<...>
export async function searchBooksAndSongs(query: string, type: 'all', page: number): Promise<...>
```

#### 採用理由

**Option 3（関数オーバーロード）を選択した理由**：

1. **キャッシュ戦略との整合性**（最重要）
   - **キャッシュ実装を考えたとき、一つの関数で管理する方が有利**
   - キャッシュロジック（保存・取得・フィルタリング）を一箇所に集約できる
   - 別々の関数（Option 1）だとキャッシュ管理が3箇所に分散

2. **コードの保守性**
   - 検索ロジックの共通部分（ページネーション、エラーハンドリング等）を一箇所に集約
   - 将来的な変更の影響範囲を最小化

3. **型安全性の確保**
   - 各検索タイプに対応した戻り値型を型システムで保証
   - ジェネリクス（Option 2）より明示的で理解しやすい

4. **可読性とIDEサポート**
   - 各シグネチャが明確
   - オートコンプリートが分かりやすい
   - ユーザーの好み：「Javaのようなオーバーロードが好き」

### 呼び出し側での型ナローイング

オーバーロードを機能させるため、呼び出し側で明示的な型ナローイングが必要：

```typescript
// ❌ 型が絞り込まれない
const { results } = await searchBooksAndSongs(query, type, page)
// results の型: FetchBooksResult[] | FetchSongsResult[] | FetchAllResult[]

// ✅ if文で型を絞り込む
let results, totalCount, totalPages
if (type === 'book') {
  ({ results, totalCount, totalPages } = await searchBooksAndSongs(query, 'book', page))
  // results の型: FetchBooksResult[]
} else if (type === 'song') {
  ({ results, totalCount, totalPages } = await searchBooksAndSongs(query, 'song', page))
  // results の型: FetchSongsResult[]
} else {
  ({ results, totalCount, totalPages } = await searchBooksAndSongs(query, 'all', page))
  // results の型: FetchAllResult[]
}
```

**なぜif文が必要か**：
- TypeScriptは関数オーバーロードの選択を実行時まで遅延できない
- 変数`type`の値に基づく型ナローイングには明示的な分岐が必要
- 三項演算子より`if`文の方が可読性が高い（ユーザーの好み）

---

## データ構造の統一化

### 課題：2つのデータ取得方法と異なる構造

型安全な検索を実装する上で、もう一つの大きな課題がありました。Supabaseには2つのデータ取得方法があり、**それぞれ異なるデータ構造を返す**のです。

#### 1. PostgREST `.select()` メソッド（ネスト構造）

```typescript
// クエリ
.select('id, song_name, books!left(book_name)')

// 返却されるデータ
{
  id: 1,
  song_name: "曲名",
  books: { book_name: "本名" }  // ✅ ネストされたオブジェクト
}
```

PostgRESTは特別な機能として、JOINされたテーブルを**ネストされたオブジェクト**として返します。

#### 2. PostgreSQL RPC関数（フラット構造）

```sql
-- supabase/migrations/xxx_add_search_function.sql
CREATE OR REPLACE FUNCTION search_books_and_songs(
  search_query TEXT,
  limit_count INT,
  offset_count INT
)
RETURNS TABLE (
  result_type TEXT,
  id BIGINT,
  book_name TEXT,    -- ✅ フラットな列
  song_name TEXT,
  grade TEXT,
  book_id BIGINT,
  created_at TIMESTAMPTZ,
  total_count BIGINT
)
AS $$
BEGIN
  RETURN QUERY
  SELECT 'song'::TEXT, s.id, b.book_name, s.song_name, s.grade, s.book_id, s.created_at, ...
  FROM songs s
  LEFT JOIN books b ON s.book_id = b.id
  ...
END;
$$ LANGUAGE plpgsql;
```

```typescript
// RPC呼び出し
.rpc('search_books_and_songs', { ... })

// 返却されるデータ
{
  result_type: 'song',
  id: 1,
  song_name: "曲名",
  book_name: "本名"  // ✅ フラットなプロパティ
}
```

RPC関数は生のSQL結果を返すため、JOINした結果は**フラットな構造**になります。

### なぜこの違いが生まれるのか

この違いは、Supabaseのアーキテクチャに起因します：

- **PostgREST**: Supabaseが提供するREST API層の**特別な機能**
  - リレーションシップを自動的にネスト構造に変換
  - `!left`、`!inner`などの記法で制御
  - 開発者体験を重視した設計

- **RPC関数**: PostgreSQLの**生のクエリ結果**
  - `RETURNS TABLE`で定義した列がそのまま返される
  - JOINは単なる列の追加として扱われる
  - データベース本来の動作

### 問題：UI層での複雑な条件分岐

初期実装では、この違いを型システムで表現しようとしました：

```typescript
// 問題のあったアプローチ
type FetchSongsResult = {
  books: { book_name: string } | null  // ネスト構造
}

type FetchAllResult = {
  book_name: string | null  // フラット構造
}
```

この場合、UI側で条件分岐が必要：

```tsx
// ❌ 複雑な条件分岐
{type === 'song' && item.books?.book_name && (
  <span>収録: {item.books.book_name}</span>
)}
{type === 'all' && item.book_name && (
  <span>収録: {item.book_name}</span>
)}
```

### 解決策：データ取得層での統一

データ構造の違いをUI層で扱うのではなく、**データ取得層で統一する**ことにしました。

#### 方針決定

当初はネスト構造への統一を検討しましたが、最終的に全て**フラット構造に統一**することにしました。

**フラット構造を選択した理由**：
1. PostgRESTで`...books(book_name)`のスプレッド構文を使えばフラット構造で取得可能
2. RPC関数は元々フラット構造なので、データ変換が不要
3. UI層でのアクセスがシンプル（`item.book_name`）
4. 型定義がより直感的
5. 将来のキャッシュ実装でもフィルタリングが容易

#### 実装：統一されたフラット構造

統一された型定義を作成します：

```typescript
type FetchBooksResult = Pick<Tables<'books'>, 'id' | 'book_name' | 'created_at'>

type FetchSongsResult = Pick<Tables<'songs'>, 'id' | 'song_name' | 'grade' | 'created_at' | 'book_id'> & { 
  book_name: string | null  // ✅ フラット構造
}

type FetchAllResult = {
  result_type: 'book' | 'song'
  total_count: number
} & (
  | { result_type: 'book'; } & FetchBooksResult
  | { result_type: 'song'; } & FetchSongsResult  // ✅ 同じフラット構造
)
```

PostgRESTでもフラット構造で取得するよう変更します：

```typescript
// PostgRESTでのフラット構造取得
const fetchSongs = async (...) => {
  let queryBuilder = supabase
    .from('songs')
    .select('id, song_name, grade, created_at, book_id, ...books(book_name)', { count: 'exact' })
    //                                                    ^^^ スプレッド構文でフラット化
  
  const { data, count, error } = await queryBuilder
  if (error) throw error
  
  return { data, count }  // データ変換不要
}

// RPC関数もフラット構造
} else {
  const { data, error } = await supabase.rpc('search_books_and_songs', {
    search_query: query || '',
    limit_count: ITEMS_PER_PAGE,
    offset_count: offset
  })
  
  if (data && data.length > 0) {
    // ✅ 既にフラット構造なのでそのまま使用
    results = data as FetchAllResult[]
  }
}
```

#### フラット構造のメリット

1. **データ変換不要**
   ```typescript
   // PostgRESTもRPCも同じフラット構造を返す
   { result_type: 'song', id: 1, song_name: "曲", book_name: "本" }
   ```

2. **型定義がシンプル**
   ```typescript
   // ネスト不要、直接プロパティとしてアクセス
   book_name: string | null
   ```

3. **処理のオーバーヘッドがない**
   - データ変換の`.map()`処理が不要
   - パフォーマンスが向上

#### UI層のシンプル化

フラット構造に統一されたことで、UI層のコードが非常にシンプルになりました：

```tsx
// ✅ シンプルかつ直感的なアクセス
{'book_name' in item && item.book_name && (
  <span>収録: {item.book_name}</span>
)}
```

検索タイプに関わらず、常に同じ方法で収録本情報にアクセスできます。ネスト構造と比較して：

```tsx
// ネスト構造の場合（より複雑）
item.books?.book_name

// フラット構造の場合（シンプル）
item.book_name
```

### 得られたメリット

1. **型安全性**: 全ての検索タイプで同じアクセスパターン
2. **保守性**: データアクセスロジックが1箇所に集約
3. **可読性**: UI側のコードが簡潔で理解しやすい
4. **拡張性**: 新しい検索タイプを追加しても変更箇所が少ない
5. **キャッシュ実装の準備**: 統一された構造により、キャッシュからのフィルタリングが容易

---

## 将来のキャッシュ戦略

ここまでの実装により、効果的なキャッシュ戦略を導入する準備が整いました。

### キャッシュ戦略の基本コンセプト

これまで説明してきた設計判断は、全てこのキャッシュ戦略に繋がります：

**基本コンセプト**:
1. デフォルトで`type=all`検索を実行し、全データを取得
2. 結果をキャッシュに保存
3. `type=book`や`type=song`の検索時は**キャッシュから絞り込み**
4. ネットワークリクエスト不要で高速な検索体験を提供

#### なぜこの戦略が可能か

1. **一つの関数で管理**
   - 関数オーバーロードにより、全ての検索が`searchBooksAndSongs`を通る
   - キャッシュロジックを一箇所に集約できる

2. **統一されたデータ構造**
   - `result_type`フィールドで本と曲を判別
   - シンプルな`.filter()`でフィルタリング可能

```typescript
// ✅ 統一されたデータ構造だからこそ簡単
const books = allResults.filter(item => item.result_type === 'book')
const songs = allResults.filter(item => item.result_type === 'song')
```

もしデータ構造が統一されていなければ、このシンプルなフィルタリングは不可能でした。

#### なぜ`all`がデフォルトなのか

```typescript
// lib/searchParams.ts
export const searchParamsCache = createSearchParamsCache({
  type: parseAsStringLiteral(['all', 'book', 'song'] as const).withDefault('all')
  //                                                             ^^^^^^^^^^^^^^
})
```

`all`をデフォルトにすることで：
1. **初回アクセスで全データを取得・キャッシュ**
2. **以降のフィルタリング検索でネットワークリクエスト不要**
3. **ユーザー体験の向上**（高速なタイプ切り替え）

この設計により、ユーザーが検索タイプを切り替えても、既にキャッシュされたデータから瞬時に結果を表示できます。

### 実装イメージ

#### 1. キャッシュ構造

```typescript
// 将来の実装例
type SearchCache = {
  [query: string]: {
    [page: number]: {
      allResults: FetchAllResult[]
      totalCount: number
      timestamp: number  // キャッシュの有効期限管理
    }
  }
}

const searchCache: SearchCache = {}
```

#### 2. キャッシュを利用した検索フロー

```typescript
export async function searchBooksAndSongs(
  query: string,
  type: SearchType,
  page: number
) {
  // キャッシュキーの生成
  const cacheKey = `${query}-${page}`
  
  // 1. キャッシュチェック
  const cached = searchCache[cacheKey]
  if (cached && !isCacheExpired(cached.timestamp)) {
    
    // 2. typeに応じてフィルタリング
    if (type === 'all') {
      return {
        results: cached.allResults,
        totalCount: cached.totalCount,
        totalPages: Math.ceil(cached.totalCount / ITEMS_PER_PAGE)
      }
    }
    
    if (type === 'book') {
      // ✅ キャッシュからbookだけをフィルタ
      const bookResults = cached.allResults.filter(
        item => item.result_type === 'book'
      ) as FetchBooksResult[]
      
      return {
        results: bookResults,
        totalCount: bookResults.length,
        totalPages: Math.ceil(bookResults.length / ITEMS_PER_PAGE)
      }
    }
    
    if (type === 'song') {
      // ✅ キャッシュからsongだけをフィルタ
      const songResults = cached.allResults.filter(
        item => item.result_type === 'song'
      ) as FetchSongsResult[]
      
      return {
        results: songResults,
        totalCount: songResults.length,
        totalPages: Math.ceil(songResults.length / ITEMS_PER_PAGE)
      }
    }
  }
  
  // 3. キャッシュミス時はDB検索
  // （現在の実装と同じ）
  const { results, totalCount, totalPages } = await fetchFromDatabase(...)
  
  // 4. 結果をキャッシュに保存
  if (type === 'all') {
    searchCache[cacheKey] = {
      allResults: results,
      totalCount,
      timestamp: Date.now()
    }
  }
  
  return { results, totalCount, totalPages }
}
```

### 実装時の考慮事項

キャッシュを実際に導入する際には、以下の点を検討する必要があります：

#### 1. ページネーション戦略

```typescript
// Option A: ページごとにキャッシュ（現在の設計に適合）
searchCache[`${query}-${page}`] = { ... }

// Option B: 全ページをまとめてキャッシュ
searchCache[query] = {
  allPages: { ... },
  totalCount: 100
}
```

**トレードオフ**:
- Option A: 初回ロードが速い、キャッシュがシンプル
- Option B: ページ遷移が速い、初回ロードが遅い

#### 2. React Query / SWRの活用

実際の実装では、専用ライブラリの使用を推奨：

```typescript
// React Queryの例
import { useQuery } from '@tanstack/react-query'

function useSearch(query: string, type: SearchType, page: number) {
  return useQuery({
    queryKey: ['search', query, type, page],
    queryFn: () => searchBooksAndSongs(query, type, page),
    staleTime: 5 * 60 * 1000,  // 5分間キャッシュ
    // type='all' の結果から type='book' や 'song' を派生
    select: (data) => type === 'all' 
      ? data 
      : filterByType(data, type)
  })
}
```

**利点**:
- 自動キャッシュ管理
- 再検証戦略の柔軟な設定
- 楽観的更新のサポート
- エラーハンドリングの簡素化

### 設計のまとめ

ここまでの設計により、効果的なキャッシュ戦略の基盤が整いました：

**実現できたこと**:

1. **一つの関数で管理**
   - 関数オーバーロードにより、キャッシュロジックを一箇所に集約
   - 別々の関数だと3箇所に分散していたキャッシュ管理を統一

2. **統一されたデータ構造**
   - PostgRESTとRPCの違いをデータ取得層で吸収
   - `result_type`によるシンプルなフィルタリング
   - UI層は常に同じアクセスパターン

3. **`all`をデフォルト**
   - 初回で全データを取得・キャッシュ
   - 以降のフィルタリングはネットワーク不要

4. **段階的な実装**
   - 現在: 基本的な検索機能（完成）
   - 将来: キャッシュ層の追加（データ構造変更不要）

この設計により、将来キャッシュを導入しても、最小限の変更で高速な検索体験を提供できます。

---

## 学んだ教訓

### 1. ORMの型システムの制限を理解する

**教訓**:
- ORMや型生成ツールには固有の制限がある
- 型システムと実行時の動作のギャップを理解することが重要
- 適切なコメントで「なぜ型アサーションが必要か」を説明する

**Supabaseの場合**:
- Foreign keyは常に配列として推論される
- PostgreSQLのメタデータにカーディナリティ情報がない
- 型アサーションは「嘘」ではなく「実行時の真実」を反映

### 2. データソースによる構造の違いを統一する

**教訓**:
- 同じデータベースでも、アクセス方法で構造が変わる（PostgREST vs RPC）
- 異なるデータ構造をUI層で扱うと、複雑な条件分岐が必要になる
- **データ取得層で統一**することで、UI層をシンプルに保てる

**実装方針**:
- データ変換は取得層（`getdataFromSupabase.ts`）で行う
- UI層は統一されたデータ構造だけを扱う
- 変更の影響範囲を最小化

### 3. 将来の拡張を見据えた設計

**教訓**:
- キャッシュ戦略を考えたとき、**一つの関数で管理する方が有利**
- 最初は別々の関数（`searchBooks`, `searchSongs`, `searchAll`）を想定していた
- しかしキャッシュロジックを一箇所に集約するため、関数オーバーロードを採用

**設計判断の流れ**:
1. 要件：型安全な検索を実装したい
2. 初期案：別々の関数
3. 検討：将来のキャッシュ実装を考えると...
4. 決定：一つの関数+オーバーロード

このように、**将来の拡張を見据えて設計を変更**することの重要性を学びました。

### 4. 段階的なリファクタリング

**実際のプロセス**:
1. Supabaseの型制限を理解（型アサーション）
2. 関数オーバーロードの導入（キャッシュ戦略を見据えて）
3. データ構造の統一化（PostgREST vs RPC）
4. UI層の簡潔化

各ステップで動作を確認し、問題を早期発見できました。

### 5. ドキュメンテーションの価値

**重要なコメント例**:

```typescript
// Type assertion: Supabase infers books as array, but runtime returns single object
return { data: data as unknown as FetchSongsResult[] | null, count }
```

なぜ型アサーションが必要かを説明することで：
- 将来の開発者が「なぜこんなコードが？」と悩まない
- リファクタリング時に誤って削除されない
- チームの知識共有が促進される

---

## 最終的な型定義

本リファクタリングで確立された型定義を以下に示します：

### データ取得層の型

```typescript
// lib/getdataFromSupabase.ts
import { Tables } from '@/types/supabase'
import { SearchType } from './searchParams'

// Books result type
type FetchBooksResult = Pick<Tables<'books'>, 'id' | 'book_name' | 'created_at'>

// Songs result type (with flat book_name)
type FetchSongsResult = Pick<Tables<'songs'>, 'id' | 'song_name' | 'grade' | 'created_at' | 'book_id'> & { 
  book_name: string | null  // ✅ フラット構造
}

// All search result type (discriminated union)
type FetchAllResult = {
  result_type: 'book' | 'song'
  total_count: number
} & (
  | { result_type: 'book'; } & FetchBooksResult
  | { result_type: 'song'; } & FetchSongsResult  // ✅ 統一されたフラット構造
)
```

### 検索パラメータの型

```typescript
// lib/searchParams.ts
export const searchParamsCache = createSearchParamsCache({
  query: parseAsString.withDefault(''),
  type: parseAsStringLiteral(['all', 'book', 'song'] as const).withDefault('all'),
  page: parseAsInteger.withDefault(1)
})

// Derived type (Single Source of Truth)
export type SearchType = Awaited<ReturnType<typeof searchParamsCache.parse>>['type']
```

### 関数シグネチャ

```typescript
// Function overloads
export async function searchBooksAndSongs(
  query: string,
  type: 'book',
  page: number
): Promise<{ results: FetchBooksResult[]; totalCount: number; totalPages: number }>

export async function searchBooksAndSongs(
  query: string,
  type: 'song',
  page: number
): Promise<{ results: FetchSongsResult[]; totalCount: number; totalPages: number }>

export async function searchBooksAndSongs(
  query: string,
  type: 'all',
  page: number
): Promise<{ results: FetchAllResult[]; totalCount: number; totalPages: number }>

// Implementation
export async function searchBooksAndSongs(
  query: string,
  type: SearchType,
  page: number
): Promise<{ 
  results: FetchBooksResult[] | FetchSongsResult[] | FetchAllResult[]; 
  totalCount: number; 
  totalPages: number 
}>
```

---

## 結論

本リファクタリングを通じて実現したこと：

### 技術的改善
- ✅ 型安全性の向上（Supabaseの制限を理解した上での適切な型アサーション）
- ✅ データ構造の統一（PostgRESTとRPCの違いを吸収）
- ✅ 保守性の向上（一つの関数でキャッシュロジックを管理）
- ✅ 将来のキャッシュ実装の準備（統一されたデータ構造）

### 設計原則
- ORMの制限を理解し、実行時の動作を反映した型定義
- データ取得層での統一により、UI層をシンプルに保つ
- 将来の拡張（キャッシュ）を見据えた設計判断
- 段階的なリファクタリングによる安全な実装

### 今後の展望
- キャッシュ層の追加（React Query / SWRの活用）
- データ構造の変更は不要
- 最小限の変更で高速な検索体験を実現

本ドキュメントが、同様の課題に直面する開発者の参考になれば幸いです。