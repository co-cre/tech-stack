---
title: エラートラッキング
description: Sentryでのエラー監視
---

本番環境のエラーを検知・追跡する。

## 方針

- Sentryを使用
- 未処理例外を自動キャプチャ
- コンテキスト（ユーザー、リクエスト）を付与
- アラート設定でSlack通知

## Cloudflare Workers

### セットアップ

```bash
bun add @sentry/cloudflare
```

### 実装

```ts
// apps/api/src/lib/sentry.ts

import { Toucan } from '@sentry/cloudflare'
import type { Context } from 'hono'
import type { Env } from '../types'

export const createSentry = (c: Context<{ Bindings: Env }>) => {
  return new Toucan({
    dsn: c.env.SENTRY_DSN,
    context: c.executionCtx,
    request: c.req.raw,
    environment: c.env.ENVIRONMENT,
  })
}
```

### エラーハンドリングミドルウェア

```ts
// apps/api/src/middleware/errorHandler.ts

import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import { createSentry } from '../lib/sentry'
import { logger } from '../lib/logger'

export const errorHandler = createMiddleware(async (c, next) => {
  try {
    await next()
  } catch (error) {
    const sentry = createSentry(c)
    const requestId = c.var.requestId

    // コンテキスト追加
    sentry.setTag('requestId', requestId)
    if (c.var.user) {
      sentry.setUser({ id: c.var.user.id, email: c.var.user.email })
    }

    if (error instanceof HTTPException) {
      // 4xxエラーはログのみ
      logger.warn('HTTP Exception', {
        requestId,
        status: error.status,
        message: error.message,
      })
      return error.getResponse()
    }

    // 5xxエラーはSentryに送信
    sentry.captureException(error)
    logger.error('Unhandled exception', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return c.json(
      { ok: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      500
    )
  }
})
```

### 使用

```ts
// apps/api/src/index.ts

import { Hono } from 'hono'
import { errorHandler } from './middleware/errorHandler'

const app = new Hono()

app.use('*', errorHandler)

// ルート定義...
```

## 手動でエラー送信

```ts
app.post('/checkout', async (c) => {
  const result = await processPayment(data)

  if (!result.ok && result.error.code === 'PAYMENT_FAILED') {
    const sentry = createSentry(c)
    sentry.captureMessage('Payment failed', {
      level: 'warning',
      extra: { orderId: data.orderId },
    })
  }

  // ...
})
```

## Sentry設定

### 環境変数

```bash
wrangler secret put SENTRY_DSN
```

### アラートルール

Sentryダッシュボードで設定：

1. **新しいエラー** → Slack通知
2. **エラー急増**（1時間で10件以上）→ Slack通知
3. **特定エラー**（PAYMENT_FAILED）→ 即座に通知

## フロントエンド

```bash
bun add @sentry/react
```

```ts
// apps/web/src/lib/sentry.ts

import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    Sentry.browserTracingIntegration(),
  ],
  tracesSampleRate: 0.1, // 10%
})
```

```tsx
// apps/web/src/main.tsx

import { ErrorBoundary } from '@sentry/react'

const App = () => (
  <ErrorBoundary fallback={<ErrorFallback />}>
    <RouterProvider router={router} />
  </ErrorBoundary>
)
```

## 関連

- [ロギング](/operations/01-logging)
- [障害対応](/operations/04-incident-response)
