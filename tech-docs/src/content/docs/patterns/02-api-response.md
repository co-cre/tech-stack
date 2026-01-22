---
title: APIレスポンス
description: Honoでの統一レスポンス形式
---

Result型をAPIレスポンスとして返すヘルパー。

## エラーの2層構造

APIエラーは2つの層で構成される。

| 層 | 種類 | 例 | HTTPステータス |
|---|------|-----|---------------|
| インフラ層 | HTTPエラー | UNAUTHORIZED, NOT_FOUND | 401, 404 等 |
| アプリ層 | ドメインエラー | プロジェクト固有 | 400 |

**全てのエラーで統一したレスポンスボディを返す**：

```json
{
  "ok": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "見つかりません"
  }
}
```

### HTTPエラー（インフラ層）

認証・認可・リソース存在など、HTTP仕様に対応するエラー。

### ドメインエラー（アプリケーション層）

ビジネスロジック固有のエラー。全て HTTP 400 で返す。プロジェクトに応じて定義。

## 実装

```ts
// apps/api/src/lib/response.ts

import { Context } from 'hono'
import { AppError, httpErrorCodes } from '@myapp/shared'

export const errorResponse = (c: Context, error: AppError) => {
  // HTTPエラーは対応するステータスコードを返す
  // ドメインエラーは400を返す
  const status = httpErrorCodes[error.code]?.status ?? 400
  return c.json({ ok: false, error }, status)
}

export const okResponse = <T>(c: Context, value: T) => {
  return c.json({ ok: true, value })
}
```

## 使用例

```ts
// routes/users.ts

app.get('/users/:id', async (c) => {
  const { id } = c.req.param()

  const result = await getUser(id)

  if (!result.ok) {
    return errorResponse(c, result.error)
  }

  return okResponse(c, result.value)
})
```

## レスポンス形式

### 成功時

```json
{
  "ok": true,
  "value": {
    "id": "123",
    "name": "John"
  }
}
```

### エラー時

```json
{
  "ok": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "User not found"
  }
}
```

## フロント側での取り扱い

```ts
const fetchUser = async (id: string): Promise<Result<User, AppError>> => {
  const res = await client.users[':id'].$get({ param: { id } })
  return res.json()
}

// エラーハンドリング
const handleApiError = (error: AppError) => {
  if (error.code === 'UNAUTHORIZED') {
    navigate('/login')
    return
  }
  toast.error(error.message)
}
```

Hono RPCにより型が共有されるため、フロント側も型安全。

## 関連

- [エラーコード](/patterns/14-error-codes)
- [Result型](/patterns/01-result)
