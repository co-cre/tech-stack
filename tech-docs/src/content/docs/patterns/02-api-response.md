---
title: APIレスポンス
description: Honoでの統一レスポンス形式
---

Result型をAPIレスポンスとして返すヘルパー。

## 実装

```ts
// apps/api/src/lib/response.ts

import { Context } from 'hono'
import { AppError, AppErrorCode } from '@myapp/shared'

const statusMap: Record<AppErrorCode, number> = {
  NOT_FOUND: 404,
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  INTERNAL_ERROR: 500,
}

export const errorResponse = (c: Context, error: AppError) => {
  return c.json({ ok: false, error }, statusMap[error.code])
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
```

Hono RPCにより型が共有されるため、フロント側も型安全。
