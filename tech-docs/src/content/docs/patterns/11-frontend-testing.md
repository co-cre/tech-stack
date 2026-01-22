---
title: フロントエンドテスト
description: フロントエンドのテスト方針
---

## 方針

**フロントエンドのテストは基本的に不要**。なるべく型検査で済ませる。

## 理由

- **型で守る**: TypeScript + zod で入出力を型安全に
- **APIテストでカバー**: ビジネスロジックはバックエンドでテスト
- **ROIが低い**: UIは変更頻度が高く、テストのメンテコストが見合わない
- **目視で十分**: Presentationコンポーネントは見れば分かる

## 型で守る例

```typescript
// Hono RPCで型安全なAPI呼び出し
const res = await api.users[':id'].$get({ param: { id } });
const data = await res.json();
// data の型は自動推論される

// zodでフォーム入力を検証
const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});
type FormData = z.infer<typeof schema>;
```

## テストを書く場合

以下のケースのみ検討:

- **複雑な計算ロジック**: UIに依存しない純粋関数
- **クリティカルなフロー**: 決済、認証など絶対に壊せない箇所

```typescript
// 純粋関数のテスト例
import { describe, test, expect } from 'bun:test';
import { calculateTotal } from './utils';

test('合計金額を計算', () => {
  const items = [{ price: 100, qty: 2 }, { price: 200, qty: 1 }];
  expect(calculateTotal(items)).toBe(400);
});
```

## 関連

- [APIテスト](/tech-stack/patterns/10-api-testing) - ビジネスロジックはここでテスト
- [Container / Presentation](/tech-stack/patterns/06-container-presentation)
