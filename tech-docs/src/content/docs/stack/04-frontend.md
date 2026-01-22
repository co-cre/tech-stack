---
title: フロントエンド
description: フロントエンド技術スタック
---

## 一覧

| 技術 | 用途 | 選定理由 |
|------|------|----------|
| Vite | ビルドツール | 高速HMR |
| React | UIライブラリ | エコシステム |
| React Router | ルーティング | [→ 詳細](/tech-stack/decisions/03-react-router) |
| React Query | サーバー状態管理 | キャッシュ・再取得 |
| react-hook-form | フォーム | [→ 詳細](/tech-stack/decisions/04-react-hook-form) |
| Tailwind CSS | スタイリング | ユーティリティファースト |
| shadcn/ui | UIコンポーネント | カスタマイズ性 |
| date-fns | 日付操作 | [→ 詳細](/tech-stack/decisions/06-date-fns) |

## Vite

高速な開発サーバーとビルドツール。ESモジュールベースのHMRで即座に変更を反映。

## React

UIライブラリ。コンポーネント指向で宣言的なUI構築。

**コンポーネント設計**: [Container / Presentation](/tech-stack/patterns/06-container-presentation)

## React Router

SPAルーティング。型安全なパラメータ取得にはカスタムフックを使用。

```typescript
// 基本的な使い方
<Route path="/users/:id" element={<UserDetail />} />
```

**関連パターン**: [URLパラメータ](/tech-stack/patterns/05-url-params)

## React Query (TanStack Query)

サーバー状態管理ライブラリ。データ取得・キャッシュ・再取得を宣言的に管理。

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['users', id],
  queryFn: () => api.users[':id'].$get({ param: { id } }),
});
```

**特徴**:
- 自動キャッシュ
- バックグラウンド再取得
- 楽観的更新

## react-hook-form

高パフォーマンスなフォームライブラリ。非制御コンポーネントベースで再レンダリングを最小化。

**関連パターン**: [フォーム](/tech-stack/patterns/08-form)

## Tailwind CSS

ユーティリティファーストのCSSフレームワーク。クラス名でスタイルを直接記述。

```tsx
<button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
  送信
</button>
```

## shadcn/ui

Radix UIベースのコンポーネントコレクション。npmパッケージではなく、コードをコピーしてカスタマイズ。

```bash
bunx shadcn-ui add button
bunx shadcn-ui add dialog
```

## date-fns

関数型の日付操作ライブラリ。Tree-shakingで必要な関数のみバンドル。

```typescript
import { format, addDays } from 'date-fns';
import { ja } from 'date-fns/locale';

format(new Date(), 'yyyy年MM月dd日', { locale: ja });
```

## テスト

**基本的に不要**。型検査で済ませる。

- TypeScript + zod で型安全に
- ビジネスロジックはAPIテストでカバー
- UIは目視確認で十分

**詳細**: [フロントエンドテスト](/tech-stack/patterns/11-frontend-testing)
