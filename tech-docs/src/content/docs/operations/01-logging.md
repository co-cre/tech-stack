---
title: ロギング
description: 構造化ログとログレベル
---

構造化ログで検索・分析しやすいログを出力。

## 方針

- JSON形式の構造化ログ
- ログレベルを適切に使い分け
- リクエストIDでトレース可能に

## ログレベル

| レベル | 用途 | 例 |
|--------|------|-----|
| error | 即座に対応が必要 | 未処理例外、外部API障害 |
| warn | 注意が必要 | レート制限、非推奨API使用 |
| info | 正常な動作記録 | リクエスト完了、バッチ処理完了 |
| debug | 開発時のみ | 変数の値、処理の詳細 |

## 実装

### ロガー

```ts
// apps/api/src/lib/logger.ts

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

type LogContext = {
  requestId?: string
  userId?: string
  [key: string]: unknown
}

const createLogger = (level: LogLevel) => {
  return (message: string, context?: LogContext) => {
    const log = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...context,
    }
    console.log(JSON.stringify(log))
  }
}

export const logger = {
  debug: createLogger('debug'),
  info: createLogger('info'),
  warn: createLogger('warn'),
  error: createLogger('error'),
}
```

### リクエストログミドルウェア

```ts
// apps/api/src/middleware/requestLog.ts

import { createMiddleware } from 'hono/factory'
import { logger } from '../lib/logger'

export const requestLogMiddleware = createMiddleware(async (c, next) => {
  const requestId = crypto.randomUUID()
  c.set('requestId', requestId)

  const start = Date.now()

  await next()

  const duration = Date.now() - start

  logger.info('Request completed', {
    requestId,
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    duration,
    userAgent: c.req.header('User-Agent'),
  })
})
```

### 使用例

```ts
// apps/api/src/routes/users.ts

app.post('/', async (c) => {
  const requestId = c.var.requestId
  const data = c.req.valid('json')

  logger.info('Creating user', { requestId, email: data.email })

  const result = await createUser(data)

  if (!result.ok) {
    logger.warn('User creation failed', {
      requestId,
      error: result.error.code,
    })
    return errorResponse(c, result.error)
  }

  logger.info('User created', { requestId, userId: result.value.id })
  return okResponse(c, result.value)
})
```

## 出力例

```json
{
  "level": "info",
  "message": "Request completed",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "method": "POST",
  "path": "/users",
  "status": 201,
  "duration": 45
}
```

## ログに含めてはいけないもの

```ts
// NG: パスワード
logger.info('Login attempt', { email, password })

// NG: トークン
logger.info('Token issued', { token })

// NG: 個人情報の詳細
logger.info('User data', { user })

// OK: 識別子のみ
logger.info('Login attempt', { email })
logger.info('Token issued', { userId })
logger.info('User fetched', { userId: user.id })
```

## Cloudflare Workers での確認

```bash
# リアルタイムログ
wrangler tail

# フィルタ付き
wrangler tail --format json | jq 'select(.level == "error")'
```

## 環境別設定

```ts
// apps/api/src/lib/logger.ts

const shouldLog = (level: LogLevel, env: string): boolean => {
  if (env === 'production') {
    return level !== 'debug'
  }
  return true
}
```

## 関連

- [エラートラッキング](/operations/02-error-tracking)
- [モニタリング](/operations/03-monitoring)
