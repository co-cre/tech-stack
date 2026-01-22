---
title: ユースケース層
description: ビジネスロジックの集約とハンドラの薄層化
---

1 操作 = 1 関数でアプリケーションの振る舞いを表現。ハンドラを薄く保つ。

## ディレクトリ構造

```
apps/api/src/usecase/
├── create-user.ts
├── update-user.ts
├── transfer.ts
└── index.ts           # re-export
```

## 責務

```
route（ハンドラ）
  ↓ バリデーション済みデータ
usecase
  ↓ ドメイン操作
domain / repo
```

| 層 | 責務 |
|---|---|
| route | HTTPリクエスト/レスポンス変換、バリデーション |
| usecase | ビジネスフロー、トランザクション境界 |
| domain | ビジネスルール |
| repo | データ永続化 |

## 実装例

```ts
// usecase/create-user.ts

type CreateUserDeps = {
  userRepo: UserRepo
}

type CreateUserInput = {
  email: string
  name: string
}

export const createUserUsecase = (deps: CreateUserDeps) => ({
  execute: async (input: CreateUserInput): Promise<Result<User, AppError>> => {
    // 1. Value Object 生成（バリデーション）
    const emailResult = Email.create(input.email)
    if (!emailResult.ok) return emailResult

    // 2. 重複チェック
    const existing = await deps.userRepo.findByEmail(emailResult.value)
    if (existing) {
      return err(appError('VALIDATION_ERROR', 'Email already exists'))
    }

    // 3. Entity 生成
    const user = User.create({
      email: emailResult.value,
      name: input.name,
    })

    // 4. 永続化
    await deps.userRepo.create(user)

    return ok(user)
  },
})
```

## ハンドラとの連携

ハンドラは薄く。バリデーション + ユースケース呼び出し + レスポンス変換のみ。

```ts
// routes/users.ts

app.post('/users', zValidator('json', CreateUserSchema), async (c) => {
  const input = c.req.valid('json')

  const result = await createUser.execute(input)

  if (!result.ok) {
    return errorResponse(c, result.error)
  }
  return okResponse(c, result.value, 201)
})
```

## アプリケーションへの注入

```ts
// app.ts

type Deps = {
  userRepo: UserRepo
}

export const createApp = (deps: Deps) => {
  const createUser = createUserUsecase({ userRepo: deps.userRepo })

  const app = new Hono()

  app.post('/users', zValidator('json', CreateUserSchema), async (c) => {
    const result = await createUser.execute(c.req.valid('json'))
    // ...
  })

  return app
}
```

## テスト

リポジトリをインメモリ実装に差し替えてテスト。

```ts
// test/usecase/create-user.test.ts

describe('createUser', () => {
  test('ユーザーを作成して返す', async () => {
    const repo = createMemoryUserRepo()
    const usecase = createUserUsecase({ userRepo: repo })

    const result = await usecase.execute({
      email: 'test@example.com',
      name: 'Alice',
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.name).toBe('Alice')
    }
  })

  test('メールアドレスが重複したらエラー', async () => {
    const repo = createMemoryUserRepo()
    await repo.create({ email: 'dup@example.com', name: 'Existing' })

    const usecase = createUserUsecase({ userRepo: repo })
    const result = await usecase.execute({
      email: 'dup@example.com',
      name: 'New',
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('VALIDATION_ERROR')
    }
  })
})
```

## テストの抽象度

| 層 | 抽象度 | 何を検証 | 速度 |
|---|---|---|---|
| domain | 高 | ビジネスルールの正しさ | 最速 |
| usecase | 中 | ユースケースの流れ・分岐 | 速い |
| routes | 低 | HTTP I/O、統合 | 普通 |

**書く優先度**: domain > usecase > routes

## メリット

- **テスト容易**: HTTP 層と分離、高速テスト
- **再利用性**: 同じユースケースを複数エンドポイントから呼べる
- **責務明確**: ハンドラが薄くなり可読性向上

## 関連

- [ドメイン層](/tech-stack/patterns/17-domain) - ビジネスルール
- [リポジトリ層](/tech-stack/patterns/03-repository) - データアクセス
- [Result型](/tech-stack/patterns/01-result) - エラーハンドリング
