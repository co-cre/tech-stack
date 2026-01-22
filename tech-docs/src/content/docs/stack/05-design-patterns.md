---
title: 設計パターン
description: コンポーネント設計、エラー処理、DI
---

| 項目 | 選定 |
|------|------|
| コンポーネント設計 | Container / Presentation |
| エラー処理 | Result型をコンポーネントで分岐 |
| DI | 関数でDeps受け取り（DIコンテナ不要） |

## Container / Presentation

コンポーネントをデータ取得とUI描画で分離。

**構成**
- `UserList.tsx` - エントリポイント（Suspense境界）
- `UserList.container.tsx` - データ取得・更新
- `UserList.presentation.tsx` - 純粋なUI

**メリット**
- テストしやすい（Presentationは純粋関数）
- 責務が明確
- Suspenseとの相性が良い

詳細は[実装パターン: Container/Presentation](/patterns/06-container-presentation/)を参照。

## 関数ベースDI

DIコンテナを使わず、関数の引数で依存を注入。

```ts
// 依存を引数で受け取る
export const createApp = (deps: { userRepo: UserRepo }) => {
  const app = new Hono()
  // ...
  return app
}

// 本番
const app = createApp({ userRepo: createD1UserRepo(db) })

// テスト
const app = createApp({ userRepo: createMemoryUserRepo() })
```

**メリット**
- シンプル
- 型安全
- テストで差し替え容易

詳細は[実装パターン: リポジトリ層](/patterns/03-repository/)を参照。
