---
title: テストの考え方
description: IFに対してテスト、実装詳細をテストしない
---

## 原則

**インターフェースに対してテストする。実装詳細をテストしない。**

## 良いテストの特徴

| 特徴 | 説明 |
|------|------|
| 公開APIをテスト | 内部メソッドではなく、呼び出し側が使うAPIをテスト |
| リファクタリングに強い | 実装を変えてもテストが壊れない |
| 振る舞いを検証 | 「何をするか」をテスト、「どうやるか」はテストしない |

## アンチパターン

```ts
// BAD: 実装詳細をテスト
test('内部のprivateメソッドが呼ばれる', () => {
  const spy = vi.spyOn(service, '_internalMethod')
  service.doSomething()
  expect(spy).toHaveBeenCalled()
})

// GOOD: 公開インターフェースをテスト
test('ユーザーが作成される', () => {
  const result = service.createUser({ name: 'Test' })
  expect(result.isOk()).toBe(true)
})
```

## テスト対象の優先度

1. **ビジネスロジック**: Result型を返す関数、ドメインロジック
2. **API層**: リクエスト → レスポンスの検証
3. **統合**: 複数コンポーネントの連携

## モックの方針

| 対象 | モックする？ | 理由 |
|------|------------|------|
| 外部API | する | 不安定、遅い |
| DB | リポジトリ層で切り替え | メモリ実装を使う |
| 内部関数 | しない | 実装詳細に依存 |
| 時間 | 必要に応じて | 再現性のため |

## リポジトリ層のテスト

```ts
// インターフェース
interface UserRepo {
  findById(id: string): Promise<User | null>
}

// 本番実装
const d1UserRepo: UserRepo = { ... }

// テスト用実装
const memoryUserRepo: UserRepo = { ... }

// テストではメモリ実装を使う
const app = createApp({ userRepo: memoryUserRepo })
```
