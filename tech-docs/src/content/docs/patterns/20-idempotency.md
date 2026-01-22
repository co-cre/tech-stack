---
title: 冪等性
description: 同じ操作を複数回実行しても結果が変わらない設計
---

同じリクエストを複数回実行しても、結果が1回だけ実行した場合と同じになる設計。ネットワーク障害での再試行を安全に行える。

## 冪等キーの考え方

クライアントが一意のキーを生成し、リクエストに付与。サーバーは同じキーの処理結果を保存・再利用。

```
POST /orders
Idempotency-Key: order-abc123-xyz789
```

## 実装パターン

### 1. 冪等キーのスキーマ

```ts
// schema/idempotency.ts

export const idempotencyKeys = sqliteTable('idempotency_keys', {
  key: text('key').primaryKey(),
  response: text('response').notNull(),  // JSON
  statusCode: integer('status_code').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
})
```

### 2. リポジトリ

```ts
// repository/idempotency-repo.ts

export type IdempotencyRepo = {
  find: (key: string) => Promise<IdempotencyRecord | null>
  save: (record: IdempotencyRecord) => Promise<void>
}

export const createIdempotencyRepo = (db: D1Database): IdempotencyRepo => ({
  find: async (key) => {
    const row = await db
      .select()
      .from(idempotencyKeys)
      .where(eq(idempotencyKeys.key, key))
      .get()

    if (!row || row.expiresAt < new Date()) {
      return null
    }
    return row
  },

  save: async (record) => {
    await db.insert(idempotencyKeys).values(record)
  },
})
```

### 3. usecase での実装

```ts
// usecase/create-order.ts

type CreateOrderDeps = {
  orderRepo: OrderRepo
  idempotencyRepo: IdempotencyRepo
}

export const createOrderUsecase = (deps: CreateOrderDeps) => ({
  execute: async (
    input: CreateOrderInput,
    idempotencyKey: string
  ): Promise<Result<Order, AppError>> => {
    // 1. 処理済みキーをチェック
    const existing = await deps.idempotencyRepo.find(idempotencyKey)
    if (existing) {
      // 既に処理済み → 保存された結果を返す
      return JSON.parse(existing.response)
    }

    // 2. 実際の処理を実行
    const order = Order.create(input)
    await deps.orderRepo.create(order)

    const result = ok(order)

    // 3. 結果を保存（24時間有効）
    await deps.idempotencyRepo.save({
      key: idempotencyKey,
      response: JSON.stringify(result),
      statusCode: 201,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    })

    return result
  },
})
```

### 4. ルートでの利用

```ts
// routes/orders.ts

app.post('/orders', zValidator('json', CreateOrderSchema), async (c) => {
  const idempotencyKey = c.req.header('Idempotency-Key')

  if (!idempotencyKey) {
    return errorResponse(c, appError('VALIDATION_ERROR', 'Idempotency-Key required'))
  }

  const result = await createOrder.execute(c.req.valid('json'), idempotencyKey)

  if (!result.ok) {
    return errorResponse(c, result.error)
  }
  return okResponse(c, result.value, 201)
})
```

## クライアント側の実装

```ts
// client/api.ts

const createOrder = async (data: CreateOrderData) => {
  // クライアントで一意のキーを生成
  const idempotencyKey = `order-${crypto.randomUUID()}`

  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify(data),
  })

  return response.json()
}
```

## 冪等キーの設計指針

| 要素 | 推奨 |
|-----|------|
| 生成元 | クライアント（UUIDv4 等） |
| 有効期限 | 24時間（用途に応じて調整） |
| スコープ | ユーザー + 操作種別ごと |
| 保存場所 | DB（D1）または KV |

## 自然に冪等な操作

一部の操作は設計上すでに冪等。キー不要。

```ts
// PUT は冪等（同じリソースを同じ値で上書き）
PUT /users/123 { name: 'Alice' }

// DELETE は冪等（存在しなくても成功扱い）
DELETE /users/123  // 2回目も 204 を返す
```

## 注意点

- **キーの重複**: 異なる操作に同じキーを使うと不整合が起きる
- **並行リクエスト**: 同じキーの同時リクエストはロックまたは排他制御が必要
- **レスポンス互換性**: 保存形式を変えると古いキャッシュが壊れる

## 関連

- [トランザクション](/tech-stack/patterns/19-transaction) - データ整合性の確保
- [エラーコード](/tech-stack/patterns/14-error-codes) - エラーレスポンスの設計
- [APIレスポンス](/tech-stack/patterns/02-api-response) - 統一的なレスポンス形式
