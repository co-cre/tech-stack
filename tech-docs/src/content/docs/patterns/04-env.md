---
title: 環境変数
description: zodによる起動時バリデーション
---

環境変数をzodでバリデーションし、型安全にアクセス。

## フロントエンド

```ts
// apps/web/src/lib/env.ts

import { z } from 'zod'

const envSchema = z.object({
  VITE_API_URL: z.string().url(),
  VITE_ENABLE_DEBUG: z.string().optional().transform(v => v === 'true'),
})

export const env = envSchema.parse({
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_ENABLE_DEBUG: import.meta.env.VITE_ENABLE_DEBUG,
})
```

## バックエンド（Cloudflare Workers）

```ts
// apps/api/src/lib/env.ts

import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(32),
  ENVIRONMENT: z.enum(['development', 'staging', 'production']),
})

export type Env = z.infer<typeof envSchema>

export const validateEnv = (env: unknown): Env => {
  return envSchema.parse(env)
}
```

```ts
// apps/api/src/index.ts

import { Hono } from 'hono'
import { validateEnv } from './lib/env'

const app = new Hono<{ Bindings: Env }>()

app.use('*', async (c, next) => {
  // 起動時にバリデーション（開発時のみ）
  if (c.env.ENVIRONMENT === 'development') {
    validateEnv(c.env)
  }
  await next()
})
```

## メリット

- **起動時エラー検出**: 不正な環境変数は早期に検出
- **型安全**: `env.VITE_API_URL` は `string` 型
- **変換**: 文字列を適切な型に変換（boolean等）

## よく使うスキーマ

```ts
// URL
z.string().url()

// 数値（文字列から変換）
z.coerce.number()

// boolean（文字列から変換）
z.string().transform(v => v === 'true')

// enum
z.enum(['development', 'staging', 'production'])

// オプショナル（デフォルト値）
z.string().default('default')
```
