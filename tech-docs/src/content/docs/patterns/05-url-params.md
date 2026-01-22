---
title: URLパラメータの型付け
description: React Router + zodで型安全なパラメータ
---

React RouterのパラメータをzodでバリデーションしてÎ型安全に。

## カスタムフック

```ts
// apps/web/src/lib/params.ts

import { z } from 'zod'
import { useParams, useSearchParams } from 'react-router-dom'

export const useTypedParams = <T extends z.ZodSchema>(schema: T): z.infer<T> => {
  const params = useParams()
  return schema.parse(params)
}

export const useTypedSearch = <T extends z.ZodSchema>(schema: T): z.infer<T> => {
  const [searchParams] = useSearchParams()
  return schema.parse(Object.fromEntries(searchParams))
}
```

## 使用例

```ts
// features/users/UserDetail.tsx

const userParamsSchema = z.object({
  id: z.string().uuid(),
})

const searchSchema = z.object({
  page: z.coerce.number().default(1),
  filter: z.string().optional(),
})

const UserPage = () => {
  // /users/:id
  const { id } = useTypedParams(userParamsSchema)

  // ?page=2&filter=active
  const { page, filter } = useTypedSearch(searchSchema)

  // id: string (UUID)
  // page: number (デフォルト1)
  // filter: string | undefined
}
```

## ルート定義

```tsx
// routes.tsx

const routes = [
  {
    path: '/users/:id',
    element: <UserPage />,
  },
  {
    path: '/users',
    element: <UserList />,
  },
]
```

## メリット

- **型安全**: `id` は `string`、`page` は `number`
- **バリデーション**: 不正なUUIDは早期にエラー
- **デフォルト値**: `z.coerce.number().default(1)`
- **変換**: 文字列から数値への自動変換

## よく使うパターン

```ts
// UUID
z.string().uuid()

// 数値（クエリパラメータは文字列なので変換）
z.coerce.number()

// ページネーション
z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})

// フィルター（複数選択）
z.object({
  status: z.array(z.enum(['active', 'inactive'])).default([]),
})
```
