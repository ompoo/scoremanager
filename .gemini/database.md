# Database Schema & Structure

データベースに関する情報です。

## Platform
- **Supabase**: PostgreSQLベースのデータベースを使用しています。

## 型定義
- データベースの型定義は `types/supabase.ts` に生成されています。
- データベース操作を行う際は、この型定義を利用して型安全性を確保してください。
- データベースのスキーマが変更されるたびに、コマンドを実行して types/supabase.ts を更新してください
    ```shell
    npx supabase gen types typescript --project-id <id> --schema public > types/supabase.ts 
    ```

## クライアント
- `utils/supabase/client.ts`: クライアントサイド用 Supabase クライアント
- `utils/supabase/server.ts`: サーバーサイド用 Supabase クライアント (SSR/Server Actions用)


