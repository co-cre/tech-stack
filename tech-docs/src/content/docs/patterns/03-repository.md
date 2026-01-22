---
title: リポジトリ層
description: インターフェースと実装の分離、関数ベースDI
---

データアクセス層をインターフェースで抽象化し、テスト時に差し替え可能にする。

## インターフェース定義

```ts
// apps/api/src/repo/interface.ts

export interface UserRepo {
  findById(id: string): Promise<User | null>
  create(data: CreateUser): Promise<User>
}
```

## 本番実装（D1）

```ts
// apps/api/src/repo/d1.ts

export const createD1UserRepo = (db: D1Database): UserRepo => ({
  async findById(id) {
    return db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first()
  },
  async create(data) {
    const id = crypto.randomUUID()
    await db
      .prepare('INSERT INTO users (id, name) VALUES (?, ?)')
      .bind(id, data.name)
      .run()
    return { id, ...data }
  },
})
```

## テスト実装（インメモリ）

```ts
// apps/api/src/repo/memory.ts

export const createMemoryUserRepo = (): UserRepo => {
  const store = new Map<string, User>()
  return {
    async findById(id) {
      return store.get(id) ?? null
    },
    async create(data) {
      const user = { id: crypto.randomUUID(), ...data }
      store.set(user.id, user)
      return user
    },
  }
}
```

## アプリケーションへの注入

```ts
// apps/api/src/app.ts

type Deps = {
  userRepo: UserRepo
}

export const createApp = (deps: Deps) => {
  const app = new Hono()

  app.get('/users/:id', async (c) => {
    const user = await deps.userRepo.findById(c.req.param('id'))
    // ...
  })

  return app
}
```

## 本番での使用

```ts
// apps/api/src/index.ts

const db = env.DB // D1 binding
const app = createApp({
  userRepo: createD1UserRepo(db),
})

export default app
```

## テストでの使用

```ts
// apps/api/test/users.test.ts

describe('GET /users/:id', () => {
  test('存在するユーザーを返す', async () => {
    const repo = createMemoryUserRepo()
    const user = await repo.create({ name: 'test' })

    const app = createApp({ userRepo: repo })
    const res = await app.request(`/users/${user.id}`)

    expect(res.status).toBe(200)
  })
})
```

## メリット

- **DIコンテナ不要**: 関数の引数で依存注入
- **テスト容易**: インメモリ実装で高速テスト
- **型安全**: インターフェースで契約を保証
