---
title: APIバージョニング
description: APIバージョン管理戦略
---

破壊的変更を安全にリリースするための戦略。

## 方針

- **最初から v1 をつける**
- URLパスでバージョン指定（`/v1/users`）
- 破壊的変更時に v2 を追加

## なぜ最初から v1 か

- 後から追加するとクライアントの大規模修正が必要
- バージョンなし → v1 の移行コストが高い
- 最初からつけておけば将来の破壊的変更に対応しやすい

## バージョニングが必要なケース

- レスポンス形式の変更
- 必須パラメータの追加
- フィールド名の変更・削除
- 認証方式の変更

## バージョニング不要なケース

- オプショナルパラメータの追加
- 新しいエンドポイントの追加
- レスポンスへのフィールド追加

## 実装パターン

### 初期構成（v1のみ）

```ts
// apps/api/src/index.ts

import { Hono } from 'hono'
import v1 from './routes/v1'

const app = new Hono()

app.route('/v1', v1)

export default app
```

```ts
// apps/api/src/routes/v1/index.ts
import { Hono } from 'hono'
import users from './users'

const app = new Hono()
app.route('/users', users)

export default app
```

### v2追加時

```ts
// apps/api/src/index.ts

import { Hono } from 'hono'
import v1 from './routes/v1'
import v2 from './routes/v2'

const app = new Hono()

app.route('/v1', v1)
app.route('/v2', v2)

export default app
```

### 共通ロジックの共有

```ts
// apps/api/src/services/user.ts
// バージョンに依存しないビジネスロジック

export const userService = {
  findById: async (id: string) => {
    return repo.findById(id)
  },
  create: async (data: CreateUserInput) => {
    return repo.create(data)
  },
}
```

```ts
// apps/api/src/routes/v1/users.ts
import { userService } from '../../services/user'

app.get('/:id', async (c) => {
  const user = await userService.findById(c.req.param('id'))
  // v1形式でレスポンス
  return c.json({ ok: true, value: user })
})

// apps/api/src/routes/v2/users.ts
import { userService } from '../../services/user'

app.get('/:id', async (c) => {
  const user = await userService.findById(c.req.param('id'))
  // v2形式でレスポンス（新しい形式）
  return c.json({ ok: true, value: { user, metadata: {} } })
})
```

## 移行戦略

### 1. 新バージョン追加

```
/v1/users  ← 既存
/v2/users  ← 新規追加
```

### 2. 非推奨化

```ts
// v1ルートに警告ヘッダー追加
app.use('/v1/*', async (c, next) => {
  await next()
  c.header('Deprecation', 'true')
  c.header('Sunset', '2025-06-01')
})
```

### 3. 旧バージョン削除

クライアントの移行完了後、v1を削除。

## クライアント側対応

```ts
// apps/web/src/lib/api.ts

import { hc } from 'hono/client'
import type { AppType } from '@myapp/api'

// バージョンを明示
const client = hc<AppType>('https://api.example.com/v1')
```

## いつ v2 を導入するか

```
破壊的変更が必要？
├── No → v1のまま
└── Yes
    └── 既存クライアントに影響？
        ├── No → v1のまま
        └── Yes → v2を追加
```

## 注意点

- バージョンは増やしすぎない（最大2つ）
- 旧バージョンのサポート期限を明示
- ドキュメントでマイグレーションガイドを提供

## 関連

- [エンドポイント命名](/patterns/15-endpoint-naming)
