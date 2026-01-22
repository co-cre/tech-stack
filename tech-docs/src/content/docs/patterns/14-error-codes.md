---
title: エラーコード
description: 統一エラーコード体系
---

エラーコードを統一し、クライアントが適切にハンドリングできるようにする。

## 方針

- コードは大文字スネークケース
- HTTPエラーとドメインエラーを明確に分離
- クライアント向けメッセージとログ用詳細を分離

## 2種類のエラー

| 種類 | HTTPステータス | 用途 |
|-----|--------------|-----|
| HTTPエラー | 各エラーに対応するコード | 認証・認可・リソース等 |
| ドメインエラー | 400 固定 | ビジネスロジック固有 |

## HTTPエラーコード

HTTP仕様に対応するエラー。対応するステータスコードを返す。

```ts
// packages/shared/error.ts

export const httpErrorCodes = {
  // 認証・認可
  UNAUTHORIZED: { status: 401, message: '認証が必要です' },
  INVALID_TOKEN: { status: 401, message: 'トークンが無効です' },
  TOKEN_EXPIRED: { status: 401, message: 'トークンが期限切れです' },
  FORBIDDEN: { status: 403, message: 'アクセス権限がありません' },

  // リソース
  NOT_FOUND: { status: 404, message: '見つかりませんでした' },
  ALREADY_EXISTS: { status: 409, message: 'すでに存在します' },
  CONFLICT: { status: 409, message: '競合が発生しました' },

  // バリデーション
  VALIDATION_ERROR: { status: 400, message: '入力内容に誤りがあります' },

  // レート制限
  RATE_LIMITED: { status: 429, message: 'リクエストが多すぎます' },

  // サーバーエラー
  INTERNAL_ERROR: { status: 500, message: 'サーバーエラーが発生しました' },
  SERVICE_UNAVAILABLE: { status: 503, message: 'サービスが一時的に利用できません' },
} as const

export type HttpErrorCode = keyof typeof httpErrorCodes
```

## ドメインエラーコード

ビジネスロジック固有のエラー。全て HTTP 400 で返す。

```ts
// packages/shared/error.ts

// プロジェクトに応じて定義
export const domainErrorCodes = {
  // 例: OUT_OF_STOCK: { message: '在庫がありません' },
} as const

export type DomainErrorCode = keyof typeof domainErrorCodes
```

## 統合型

```ts
// packages/shared/error.ts

export type ErrorCode = HttpErrorCode | DomainErrorCode

export type AppError = {
  code: ErrorCode
  message: string
}

export const appError = (
  code: ErrorCode,
  message?: string
): AppError => {
  const defaultMessage =
    httpErrorCodes[code as HttpErrorCode]?.message ??
    domainErrorCodes[code as DomainErrorCode]?.message ??
    'エラーが発生しました'

  return {
    code,
    message: message ?? defaultMessage,
  }
}
```

## レスポンスヘルパー

```ts
// apps/api/src/lib/response.ts

import { Context } from 'hono'
import { AppError, httpErrorCodes, HttpErrorCode } from '@myapp/shared'

export const errorResponse = (c: Context, error: AppError) => {
  // HTTPエラーは対応するステータスコードを返す
  // ドメインエラーは400を返す
  const httpError = httpErrorCodes[error.code as HttpErrorCode]
  const status = httpError?.status ?? 400

  return c.json({ ok: false, error }, status)
}
```

## 使用例

```ts
// 認証エラー（401）
return errorResponse(c, appError('UNAUTHORIZED'))

// リソースエラー（404）
return errorResponse(c, appError('NOT_FOUND', 'ユーザーが見つかりません'))

// バリデーションエラー（400）
return errorResponse(c, appError('VALIDATION_ERROR'))
```

## レスポンス例

```json
{
  "ok": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "認証が必要です"
  }
}
```

## フロント側ハンドリング

```tsx
const handleError = (error: AppError) => {
  switch (error.code) {
    case 'UNAUTHORIZED':
    case 'TOKEN_EXPIRED':
      navigate('/login')
      return
    default:
      toast.error(error.message)
  }
}
```

## 関連

- [Result型](/patterns/01-result)
- [APIレスポンス](/patterns/02-api-response)
