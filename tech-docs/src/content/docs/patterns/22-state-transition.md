---
title: 状態遷移
description: 状態遷移ルールを一箇所に集約し型で保護するパターン
---

状態遷移のルールをオブジェクトで一箇所に定義し、TypeScript の型で保護するパターン。

## 課題

- 状態遷移の検証コードが散らばる
- 不正な遷移が実行時まで検出されない
- 「どの状態からどの操作が可能か」が把握しづらい

## パターン概要

遷移ルールをオブジェクトで一箇所に定義し、型で保護する。XState 等のライブラリ不要で実現可能。

## 実装例

### 状態とイベントの型定義

```ts
// domain/order/types.ts

// 状態の型
type OrderStatus = 'draft' | 'pending' | 'paid' | 'shipped' | 'cancelled'

// イベント（アクション）の型
type OrderEvent =
  | { type: 'submit' }
  | { type: 'pay'; paymentId: string }
  | { type: 'ship'; trackingId: string }
  | { type: 'cancel'; reason: string }
```

### 遷移テーブル

```ts
// domain/order/transitions.ts

// 遷移テーブル（どの状態から、どのイベントが発火可能か）
const transitions: Record<OrderStatus, OrderEvent['type'][]> = {
  draft:     ['submit', 'cancel'],
  pending:   ['pay', 'cancel'],
  paid:      ['ship'],
  shipped:   [],
  cancelled: [],
}

// 遷移先マッピング
const nextStatus: Record<OrderEvent['type'], OrderStatus> = {
  submit: 'pending',
  pay:    'paid',
  ship:   'shipped',
  cancel: 'cancelled',
}

// ヘルパー関数
export function canTransition(current: OrderStatus, event: OrderEvent['type']): boolean {
  return transitions[current].includes(event)
}

export function getNextStatus(event: OrderEvent['type']): OrderStatus {
  return nextStatus[event.type]
}
```

### API エンドポイント

Action-based なエンドポイント設計と組み合わせる。

```ts
// routes/orders/[id]/ship.ts

app.post('/orders/:id/ship', async (c) => {
  const order = await orderRepo.findById(c.req.param('id'))
  if (!order) {
    return c.json({ error: { code: 'NOT_FOUND' } }, 404)
  }

  // 遷移可能かチェック
  if (!canTransition(order.status, 'ship')) {
    return c.json({
      error: {
        code: 'INVALID_STATE_TRANSITION',
        message: `Cannot ship order in ${order.status} status`,
      }
    }, 400)
  }

  const { trackingId } = await c.req.json()
  const updated = await orderRepo.update({
    ...order,
    status: 'shipped',
    trackingId,
  })

  return c.json({ data: updated })
})
```

### ドメイン層での利用

```ts
// domain/order/order.ts

export const Order = {
  canTransition: (order: Order, event: OrderEvent['type']): boolean => {
    return canTransition(order.status, event)
  },

  apply: (order: Order, event: OrderEvent): Order => {
    if (!canTransition(order.status, event.type)) {
      throw new Error(`Invalid transition: ${order.status} -> ${event.type}`)
    }

    switch (event.type) {
      case 'submit':
        return { ...order, status: 'pending' }
      case 'pay':
        return { ...order, status: 'paid', paymentId: event.paymentId }
      case 'ship':
        return { ...order, status: 'shipped', trackingId: event.trackingId }
      case 'cancel':
        return { ...order, status: 'cancelled', cancelReason: event.reason }
    }
  },
}
```

## 利点

- **一箇所に集約**: 遷移ルールが `transitions` オブジェクトに明示的に定義される
- **型安全**: イベント型が網羅されているか TypeScript がチェック
- **ライブラリ不要**: XState 等の依存なしで実現
- **テストしやすい**: 純粋関数なのでユニットテストが容易

## 使い分け

| ユースケース | 推奨 |
|-------------|------|
| シンプルな状態遷移 | このパターン |
| 複雑な階層状態・並行状態 | XState |
| 状態遷移の可視化が必要 | XState（statecharts） |

## 関連

- [エンドポイント設計](/tech-stack/patterns/15-endpoint-naming) - Action-based エンドポイント
- [ドメインモデル](/tech-stack/patterns/17-domain) - ドメイン層での状態管理
- [Switch 網羅性チェック](/tech-stack/patterns/21-switch-exhaustiveness) - 状態の網羅性保証
