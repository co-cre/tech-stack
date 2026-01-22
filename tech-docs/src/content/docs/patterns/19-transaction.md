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

DB の分散トランザクションは使わない。代わりに Saga パターンか冪等性で対応。

### Saga + 補償トランザクション

外部 API 失敗時に DB 変更を戻す。

```ts
// usecase/create-subscription.ts

export const createSubscriptionUsecase = (deps: {
  userRepo: UserRepo
  stripeClient: StripeClient
}) => ({
  execute: async (userId: string, planId: string) => {
    // 1. DB に仮レコード作成（status: pending）
    const subscription = Subscription.create({ userId, planId, status: 'pending' })
    await deps.userRepo.createSubscription(subscription)

    // 2. 外部 API 呼び出し
    const stripeResult = await deps.stripeClient.createSubscription({
      customerId: userId,
      priceId: planId,
    })

    if (!stripeResult.ok) {
      // 3. 失敗時は補償トランザクション（ロールバック）
      await deps.userRepo.deleteSubscription(subscription.id)
      return err(appError('EXTERNAL_ERROR', 'Stripe subscription failed'))
    }

    // 4. 成功時はステータス更新
    await deps.userRepo.updateSubscription({
      ...subscription,
      stripeId: stripeResult.value.id,
      status: 'active',
    })

    return ok(subscription)
  },
})
```

### At-least-once + 冪等性

再試行を前提とした設計。詳細は[冪等性](/tech-stack/patterns/20-idempotency)を参照。

```ts
// 概念: 同じリクエストを複数回実行しても結果が同じ
const result1 = await createOrder.execute({ idempotencyKey: 'order-123', ... })
const result2 = await createOrder.execute({ idempotencyKey: 'order-123', ... })
// result1 と result2 は同じ（2回目は保存済みの結果を返す）
```

## 戦略の使い分け

| シナリオ | 戦略 |
|---------|------|
| 単一 DB 内の複数テーブル更新 | `batch()` / トランザクション |
| 外部 API + DB | Saga + 補償トランザクション |
| 再試行が多い処理 | At-least-once + 冪等性 |
| 最終的整合性で十分 | イベント駆動 + 非同期処理 |

## 注意点

- **D1 の制限**: `batch()` は同一リクエスト内のみ。長時間トランザクションは不可
- **補償の設計**: 「戻す」ロジックが書けない操作（メール送信等）は Saga に不向き
- **冪等性キー**: ユーザー起点の操作は必ず冪等性キーを使う

## 関連

- [冪等性](/tech-stack/patterns/20-idempotency) - 再試行前提の設計
- [リポジトリ層](/tech-stack/patterns/03-repository) - データアクセスの抽象化
- [ユースケース層](/tech-stack/patterns/18-usecase) - トランザクション境界の管理
