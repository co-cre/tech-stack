---
title: テスト
description: インターフェースに対するテスト
---

実装詳細ではなく、公開インターフェースに対してテスト。

## 方針

- **IFに対してテスト**: 内部実装は変更可能
- **外部依存はモック**: DB、外部APIはインメモリ実装
- **E2Eは最小限**: クリティカルパスのみ

## APIテスト

```ts
// apps/api/test/users.test.ts

import { describe, test, expect } from 'bun:test'
import { createApp } from '../src/app'
import { createMemoryUserRepo } from '../src/repo/memory'

describe('GET /users/:id', () => {
  test('存在するユーザーを返す', async () => {
    const repo = createMemoryUserRepo()
    const user = await repo.create({ name: 'test' })

    const app = createApp({ userRepo: repo })
    const res = await app.request(`/users/${user.id}`)

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.ok).toBe(true)
    expect(json.value).toEqual(user)
  })

  test('存在しないユーザーは404', async () => {
    const repo = createMemoryUserRepo()
    const app = createApp({ userRepo: repo })

    const res = await app.request('/users/not-found')

    expect(res.status).toBe(404)
    const json = await res.json()
    expect(json.ok).toBe(false)
    expect(json.error.code).toBe('NOT_FOUND')
  })
})
```

## Presentationコンポーネントテスト

```tsx
// apps/web/test/UserList.test.tsx

import { render, screen } from '@testing-library/react'
import { UserListPresentation } from '../src/features/users/UserList.presentation'

describe('UserListPresentation', () => {
  test('ユーザー一覧を表示', () => {
    const users = [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
    ]

    render(
      <UserListPresentation
        users={users}
        onDelete={() => {}}
        isDeleting={false}
      />
    )

    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  test('削除中はボタンが無効', () => {
    render(
      <UserListPresentation
        users={[{ id: '1', name: 'Alice' }]}
        onDelete={() => {}}
        isDeleting={true}
      />
    )

    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

## テスト実行

```bash
# 全テスト
bun test

# 特定ファイル
bun test users.test.ts

# ウォッチモード
bun test --watch
```

## ポイント

### モックしないもの

- 純粋関数
- ユーティリティ
- 状態管理ロジック

### モックするもの

- DB（インメモリ実装で代替）
- 外部API
- 現在時刻（必要な場合）
