---
title: エンドポイント命名
description: RESTful エンドポイント命名規約
---

一貫したAPI設計でフロントエンドとの連携をスムーズに。

## 方針

- 名詞は複数形（`/users`, `/posts`）
- ケバブケース（`/user-profiles`）
- 動詞は HTTP メソッドで表現

## 基本パターン

| 操作 | メソッド | パス | 説明 |
|------|----------|------|------|
| 一覧 | GET | `/users` | 全件取得（ページング） |
| 詳細 | GET | `/users/:id` | 単一取得 |
| 作成 | POST | `/users` | 新規作成 |
| 更新 | PUT | `/users/:id` | 全体更新 |
| 部分更新 | PATCH | `/users/:id` | 一部更新 |
| 削除 | DELETE | `/users/:id` | 削除 |

## ネストしたリソース

親子関係があるリソース。2階層まで。

```
GET    /users/:userId/posts        # ユーザーの投稿一覧
POST   /users/:userId/posts        # ユーザーの投稿作成
GET    /users/:userId/posts/:id    # 特定の投稿
```

3階層以上は避ける：

```
# NG: 深すぎる
GET /organizations/:orgId/teams/:teamId/members/:memberId/tasks

# OK: フラットに
GET /tasks?memberId=xxx
```

## アクション

CRUD以外の操作は動詞を使う。

```
POST /users/:id/activate      # アクティベート
POST /users/:id/deactivate    # 非アクティベート
POST /orders/:id/cancel       # 注文キャンセル
POST /files/:id/download      # ファイルダウンロード
```

## 検索・フィルタ

クエリパラメータで指定。

```
GET /users?status=active&role=admin    # フィルタ
GET /users?q=john                      # 検索
GET /users?sort=createdAt&order=desc   # ソート
GET /users?page=2&limit=20             # ページング
```

## Hono実装例

```ts
// apps/api/src/routes/users.ts

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const app = new Hono()

// 一覧
app.get('/', async (c) => {
  const { page, limit } = c.req.query()
  const users = await repo.findMany({ page: Number(page), limit: Number(limit) })
  return okResponse(c, users)
})

// 詳細
app.get('/:id', async (c) => {
  const user = await repo.findById(c.req.param('id'))
  if (!user) return errorResponse(c, appError('NOT_FOUND'))
  return okResponse(c, user)
})

// 作成
app.post(
  '/',
  zValidator('json', createUserSchema),
  async (c) => {
    const data = c.req.valid('json')
    const user = await repo.create(data)
    return c.json({ ok: true, value: user }, 201)
  }
)

// 更新
app.put(
  '/:id',
  zValidator('json', updateUserSchema),
  async (c) => {
    const data = c.req.valid('json')
    const user = await repo.update(c.req.param('id'), data)
    return okResponse(c, user)
  }
)

// 削除
app.delete('/:id', async (c) => {
  await repo.delete(c.req.param('id'))
  return c.json({ ok: true, value: null }, 204)
})

// アクション
app.post('/:id/activate', async (c) => {
  await repo.activate(c.req.param('id'))
  return okResponse(c, null)
})

export default app
```

## ルーティング構成

```ts
// apps/api/src/index.ts

import { Hono } from 'hono'
import users from './routes/users'
import posts from './routes/posts'

const app = new Hono()

app.route('/users', users)
app.route('/posts', posts)

export default app
```

## 関連

- [APIバージョニング](/patterns/16-api-versioning)
- [APIレスポンス](/patterns/02-api-response)
