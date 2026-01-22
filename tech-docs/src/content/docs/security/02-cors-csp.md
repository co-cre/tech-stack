---
title: CORS/CSP
description: HonoでのCORS・CSP設定
---

クロスオリジンリクエストとコンテンツセキュリティを適切に設定。

## CORS

### 基本設定

```ts
// apps/api/src/index.ts

import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

app.use(
  '/api/*',
  cors({
    origin: ['https://example.com', 'https://app.example.com'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['X-Request-Id'],
    maxAge: 86400, // 24時間
    credentials: true,
  })
)
```

### 環境ごとの設定

```ts
// apps/api/src/middleware/cors.ts

import { cors } from 'hono/cors'
import type { Env } from '../types'

const originsByEnv = {
  development: ['http://localhost:5173', 'http://localhost:3000'],
  staging: ['https://staging.example.com'],
  production: ['https://example.com', 'https://app.example.com'],
}

export const corsMiddleware = (env: Env['ENVIRONMENT']) => {
  return cors({
    origin: originsByEnv[env],
    credentials: true,
  })
}
```

```ts
// apps/api/src/index.ts

app.use('/api/*', (c, next) => {
  const middleware = corsMiddleware(c.env.ENVIRONMENT)
  return middleware(c, next)
})
```

### 動的オリジン

サブドメインなど動的に許可する場合。

```ts
app.use(
  '/api/*',
  cors({
    origin: (origin) => {
      // example.comのサブドメインを許可
      if (origin.endsWith('.example.com')) {
        return origin
      }
      return null
    },
  })
)
```

## CSP（Content Security Policy）

### フロントエンド設定

```ts
// apps/web/vite.config.ts（開発用）
// 本番はCloudflare Pagesのヘッダーで設定

export default defineConfig({
  server: {
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "connect-src 'self' https://api.example.com",
      ].join('; '),
    },
  },
})
```

### Cloudflare Pages

```toml
# _headers ファイル

/*
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.example.com
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
```

### Workers（APIレスポンス）

```ts
// apps/api/src/middleware/security.ts

import { createMiddleware } from 'hono/factory'

export const securityHeaders = createMiddleware(async (c, next) => {
  await next()

  c.header('X-Content-Type-Options', 'nosniff')
  c.header('X-Frame-Options', 'DENY')
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin')
})
```

```ts
// apps/api/src/index.ts

app.use('*', securityHeaders)
```

## よくある問題

### CORSエラー

```
Access to fetch at 'https://api.example.com' from origin 'https://example.com'
has been blocked by CORS policy
```

**確認事項:**
1. `origin` に正しいURLが含まれているか
2. `credentials: true` の場合、`origin` が `*` でないか
3. プリフライトリクエスト（OPTIONS）が許可されているか

### CSP違反

```
Refused to execute inline script because it violates the following
Content Security Policy directive
```

**対応:**
1. インラインスクリプトを外部ファイルに移動
2. または `'unsafe-inline'` を追加（非推奨）

## 関連

- [入力検証](/security/03-input-validation)
- [チェックリスト](/security/04-checklist)
