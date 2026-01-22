---
title: フロントエンドディレクトリ構成
description: React + Viteアプリケーションの推奨ディレクトリ構造
---

## 構造

```
apps/web/
└── src/
    ├── app.tsx                    # ルーティング定義
    ├── main.tsx
    │
    ├── features/                  # 機能単位
    │   └── users/                 # kebab-case
    │       ├── index.ts           # barrel（公開APIのみ）
    │       ├── Page.tsx           # PascalCase
    │       ├── UserList.container.tsx
    │       ├── UserList.presentation.tsx
    │       └── hooks.ts           # camelCase、API呼び出しもここ
    │
    ├── components/
    │   ├── ui/                    # shadcn/ui
    │   ├── Header.tsx
    │   └── Layout.tsx
    │
    └── lib/
        ├── api.ts
        ├── env.ts
        └── providers/
            ├── auth.tsx
            └── query.tsx
```

## 配置ルール

| ディレクトリ | 内容 | 例 |
|-------------|------|-----|
| `features/` | 機能ごとにPage.tsx + Container/Presentation | users/, orders/ |
| `components/ui/` | shadcn/ui（変更しない） | Button, Dialog |
| `components/` | プロジェクト固有の共通コンポーネント | Header, Layout |
| `lib/providers/` | グローバル状態（認証、QueryClient等） | auth, query |

## 命名規則

| 対象 | 規則 | 例 |
|------|------|-----|
| ディレクトリ | kebab-case | user-settings/, order-history/ |
| コンポーネント | PascalCase.tsx | UserList.tsx, OrderForm.tsx |
| 非コンポーネント | camelCase.ts | hooks.ts, utils.ts |

## Barrel export

featureルートのみ `index.ts` を作成。公開したいものだけre-export。

```typescript
// features/users/index.ts
export { Page } from './Page';
export { useUsers } from './hooks';
```

## API呼び出し

`features/hooks.ts` 内で useQuery を直書き。共有が必要になったら `lib/api/` に昇格。

```typescript
// features/users/hooks.ts
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => api.users.$get(),
  });
};
```

## 型定義

Hono RPC前提で別途定義ファイルは不要。バックエンドの型がそのまま効く。

フロント固有の型が必要な場合:
- 小さければ各ファイル内
- 共通なら `lib/types.ts`

## 関連パターン

- [Container / Presentation](/tech-stack/patterns/06-container-presentation)
- [フォーム](/tech-stack/patterns/08-form)
