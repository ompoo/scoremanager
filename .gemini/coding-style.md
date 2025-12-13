# Coding Style & Conventions

このプロジェクトのコーディング規約です。

## 言語 & フレームワーク
- **TypeScript**: 全体的にTypeScriptを使用し、可能な限り厳密な型付けを行います。`any`の使用は避けてください。
- **Next.js (App Router)**: `app/` ディレクトリ配下の構造に従います。Server Componentsをデフォルトとし、インタラクティブな機能が必要な場合のみ `'use client'` を使用します。
- **React**: Functional Components と Hooks を使用します。

## スタイリング
- **Tailwind CSS**: スタイリングにはTailwind CSS (v4) を使用します。
- CSS Modulesやstyled-componentsは原則使用しません。

## 命名規則
- **コンポーネント**: PascalCase (例: `MyComponent.tsx`)
- **関数・変数**: camelCase (例: `myFunction`, `myVariable`)
- **定数**: UPPER_SNAKE_CASE (例: `MAX_COUNT`)

## その他
- **バリデーション**: データ検証には `zod` を使用します。
- **状態管理 (URL)**: URLクエリパラメータの管理には `nuqs` を使用します。
- **ディレクトリ構成**:そのページのみで使用されるコンポーネントは同階層の`_component/`に追加するようにします。
