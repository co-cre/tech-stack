---
title: 認可
description: RBACベースの認可パターン
---

ロールベースアクセス制御（RBAC）で権限を管理。

## 方針

- シンプルなロール定義（admin / member / viewer）
- ミドルウェアで権限チェック
- 必要になるまで複雑化しない

## ロール定義

```ts
// packages/shared/auth.ts

export const roles = ['admin', 'member', 'viewer'] as const
export type Role = (typeof roles)[number]

// 権限の階層
const roleHierarchy: Record<Role, number> = {
  admin: 3,
  member: 2,
  viewer: 1,
}

export const hasRole = (userRole: Role, requiredRole: Role): boolean => {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}
```

## 認可ミドルウェア

```ts
// apps/api/src/middleware/authorize.ts

import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import { Role, hasRole } from '@myapp/shared'

type AuthEnv = {
  Variables: {
    user: { id: string; email: string; role: Role }
  }
}

export const authorize = (requiredRole: Role) => {
  return createMiddleware<AuthEnv>(async (c, next) => {
    const user = c.var.user

    if (!user) {
      throw new HTTPException(401, { message: 'Unauthorized' })
    }

    if (!hasRole(user.role, requiredRole)) {
      throw new HTTPException(403, { message: 'Forbidden' })
    }

    await next()
  })
}
```

## 使用例

```ts
// apps/api/src/routes/admin.ts

import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import { authorize } from '../middleware/authorize'

const app = new Hono()

// 認証 → 認可の順で適用
app.use('/admin/*', authMiddleware, authorize('admin'))

app.get('/admin/users', async (c) => {
  const users = await repo.findAll()
  return c.json({ ok: true, value: users })
})

app.delete('/admin/users/:id', async (c) => {
  const { id } = c.req.param()
  await repo.delete(id)
  return c.json({ ok: true, value: null })
})
```

## リソースベース認可

「自分のリソースのみ編集可能」のようなケース。

```ts
// apps/api/src/middleware/authorize.ts

export const authorizeOwner = (getOwnerId: (c: Context) => Promise<string>) => {
  return createMiddleware<AuthEnv>(async (c, next) => {
    const user = c.var.user
    const ownerId = await getOwnerId(c)

    // adminは常に許可
    if (user.role === 'admin') {
      return next()
    }

    if (user.id !== ownerId) {
      throw new HTTPException(403, { message: 'Forbidden' })
    }

    await next()
  })
}
```

```ts
// 使用例
app.put(
  '/posts/:id',
  authMiddleware,
  authorizeOwner(async (c) => {
    const post = await repo.findById(c.req.param('id'))
    return post?.authorId ?? ''
  }),
  async (c) => {
    // 更新処理
  }
)
```

## いつRBACを超えるか

以下の場合は属性ベース（ABAC）やポリシーベースを検討：

- 「部署Aのマネージャーは部署Aのデータのみ閲覧可能」
- 「プロジェクトメンバーはそのプロジェクトのタスクを編集可能」

ただし、3-5人チームでは過剰なことが多い。

## 関連

- [認証ミドルウェア](/patterns/12-auth-middleware)
