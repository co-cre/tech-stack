---
title: 認証ミドルウェア
description: Honoでの認証ミドルウェア実装
---

Cloudflare AccessまたはJWTを使った認証をミドルウェアで処理。

## 方針

- 認証はミドルウェアで一元管理
- 認証情報は `c.var` に格納
- ルートごとの適用は明示的に

## Cloudflare Access

Cloudflare Accessを使う場合、JWTは `CF-Access-JWT-Assertion` ヘッダーに含まれる。

```ts
// apps/api/src/middleware/auth.ts

import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'

type AuthUser = {
  id: string
  email: string
}

type Env = {
  Variables: {
    user: AuthUser
  }
}

export const authMiddleware = createMiddleware<Env>(async (c, next) => {
  const jwt = c.req.header('CF-Access-JWT-Assertion')

  if (!jwt) {
    throw new HTTPException(401, { message: 'Unauthorized' })
  }

  // Cloudflare Access が検証済みのため、デコードのみ
  const payload = decodeJwt(jwt)

  c.set('user', {
    id: payload.sub,
    email: payload.email,
  })

  await next()
})

const decodeJwt = (token: string) => {
  const payload = token.split('.')[1]
  return JSON.parse(atob(payload))
}
```

## 自前JWT

Firebase AuthやLuciaで発行したJWTを検証する場合。

```ts
// apps/api/src/middleware/auth.ts

import { verify } from 'hono/jwt'
import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'

export const authMiddleware = createMiddleware<Env>(async (c, next) => {
  const authHeader = c.req.header('Authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    throw new HTTPException(401, { message: 'Unauthorized' })
  }

  const token = authHeader.slice(7)

  try {
    const payload = await verify(token, c.env.JWT_SECRET)
    c.set('user', {
      id: payload.sub as string,
      email: payload.email as string,
    })
  } catch {
    throw new HTTPException(401, { message: 'Invalid token' })
  }

  await next()
})
```

## 使用例

```ts
// apps/api/src/routes/users.ts

import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'

const app = new Hono()

// 認証が必要なルートにのみ適用
app.use('/users/*', authMiddleware)

app.get('/users/me', (c) => {
  const user = c.var.user
  return c.json({ ok: true, value: user })
})

// 認証不要なルート
app.get('/health', (c) => c.json({ status: 'ok' }))
```

## オプショナル認証

ログイン済みなら追加情報を返す、など。

```ts
export const optionalAuthMiddleware = createMiddleware<Env>(async (c, next) => {
  const authHeader = c.req.header('Authorization')

  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.slice(7)
      const payload = await verify(token, c.env.JWT_SECRET)
      c.set('user', {
        id: payload.sub as string,
        email: payload.email as string,
      })
    } catch {
      // 無視（未認証として扱う）
    }
  }

  await next()
})
```

## 関連

- [認可](/patterns/13-authorization)
- [認証選定ガイド](/guides/02-auth)
