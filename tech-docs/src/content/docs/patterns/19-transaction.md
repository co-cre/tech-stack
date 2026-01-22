---
title: トランザクション
description: 単一・複数ストレージでのデータ整合性
---

データ変更の整合性を保証するパターン。単一ストレージと複数ストレージで戦略が異なる。

## 単一ストレージ（D1）

usecase 層でトランザクション境界を管理。D1 の `batch()` でアトミック操作。

### リポジトリに runInTransaction を追加

```ts
// repository/user-repo.ts

export type UserRepo = {
  findById: (id: string) => Promise<User | null>
  create: (user: User) => Promise<void>
  update: (user: User) => Promise<void>
  runInTransaction: <T>(fn: (repo: UserRepo) => Promise<T>) => Promise<T>
}

export const createUserRepo = (db: D1Database): UserRepo => ({
  // ... 他のメソッド

  runInTransaction: async (fn) => {
    // D1 は batch() で複数クエリをアトミックに実行
    // トランザクション内での操作を収集し、最後に batch 実行
    const operations: D1PreparedStatement[] = []

    const txRepo: UserRepo = {
      ...createUserRepo(db),
      create: async (user) => {
        operations.push(
          db.prepare('INSERT INTO users (id, email, name) VALUES (?, ?, ?)')
            .bind(user.id, user.email, user.name)
        )
      },
      update: async (user) => {
        operations.push(
          db.prepare('UPDATE users SET name = ? WHERE id = ?')
            .bind(user.name, user.id)
        )
      },
    }

    const result = await fn(txRepo)
    await db.batch(operations)
    return result
  },
})
```

### usecase での利用

```ts
// usecase/transfer.ts

export const transferUsecase = (deps: { accountRepo: AccountRepo }) => ({
  execute: async (fromId: string, toId: string, amount: number) => {
    return deps.accountRepo.runInTransaction(async (repo) => {
      const from = await repo.findById(fromId)
      const to = await repo.findById(toId)

      if (!from || !to) {
        return err(appError('NOT_FOUND', 'Account not found'))
      }
      if (from.balance < amount) {
        return err(appError('VALIDATION_ERROR', 'Insufficient balance'))
      }

      await repo.update(Account.withdraw(from, amount))
      await repo.update(Account.deposit(to, amount))

      return ok(undefined)
    })
  },
})
```

## 複数ストレージ（D1 + Stripe 等）

DB の分散トランザクションは使わない。**冪等性 + リトライ** で対応する。

:::note[Saga パターンは使わない]
補償トランザクション（ロールバック処理）は複雑になりがちで、「戻せない操作」（メール送信等）があると破綻する。冪等性で再試行可能にする方がシンプル。
:::

### 冪等性 + リトライによる整合性

外部 API を含む処理は、失敗しても安全に再試行できる設計にする。

```ts
// usecase/create-subscription.ts

export const createSubscriptionUsecase = (deps: {
  subscriptionRepo: SubscriptionRepo
  stripeClient: StripeClient
  idempotencyRepo: IdempotencyRepo
}) => ({
  execute: async (userId: string, planId: string, idempotencyKey: string) => {
    // 1. 処理済みチェック
    const existing = await deps.idempotencyRepo.find(idempotencyKey)
    if (existing) {
      return JSON.parse(existing.response)
    }

    // 2. DB に pending レコード作成（冪等キーで重複防止）
    const subscription = await deps.subscriptionRepo.findOrCreate({
      idempotencyKey,
      userId,
      planId,
      status: 'pending',
    })

    // 3. 外部 API 呼び出し（Stripe 側も冪等キーを使う）
    const stripeResult = await deps.stripeClient.createSubscription({
      customerId: userId,
      priceId: planId,
      idempotencyKey,  // Stripe API も冪等性をサポート
    })

    if (!stripeResult.ok) {
      // 失敗時は pending のまま。リトライで再実行される
      return err(appError('EXTERNAL_ERROR', 'Stripe subscription failed'))
    }

    // 4. 成功時はステータス更新 + 結果保存
    const updated = await deps.subscriptionRepo.update({
      ...subscription,
      stripeId: stripeResult.value.id,
      status: 'active',
    })

    await deps.idempotencyRepo.save({
      key: idempotencyKey,
      response: JSON.stringify(ok(updated)),
      statusCode: 201,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    })

    return ok(updated)
  },
})
```

**ポイント:**
- `findOrCreate` で DB 操作も冪等に
- 外部 API（Stripe 等）にも冪等キーを渡す
- 失敗時は `pending` のまま残り、リトライで再実行

### リトライの実装

クライアント側またはジョブキューでリトライを実装。

```ts
// client/api.ts（クライアント側リトライ）

const createSubscription = async (data: CreateSubscriptionData) => {
  const idempotencyKey = `sub-${crypto.randomUUID()}`

  // 最大3回リトライ
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(data),
    })

    if (response.ok || response.status < 500) {
      return response.json()
    }

    // 5xx エラーはリトライ
    await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
  }

  throw new Error('Max retries exceeded')
}
```

## 戦略の使い分け

| シナリオ | 戦略 |
|---------|------|
| 単一 DB 内の複数テーブル更新 | `batch()` / トランザクション |
| 外部 API + DB | 冪等性 + リトライ |
| 最終的整合性で十分 | イベント駆動 + 非同期処理 |

## 注意点

- **D1 の制限**: `batch()` は同一リクエスト内のみ。長時間トランザクションは不可
- **冪等キー**: ユーザー起点の操作は必ず冪等性キーを使う
- **pending の掃除**: 一定期間 pending のままのレコードは定期バッチで処理

## 関連

- [冪等性](/tech-stack/patterns/20-idempotency) - 再試行前提の設計
- [リポジトリ層](/tech-stack/patterns/03-repository) - データアクセスの抽象化
- [ユースケース層](/tech-stack/patterns/18-usecase) - トランザクション境界の管理
