---
title: ドメイン層
description: Entity、Value Object、ドメインサービス
---

ビジネスロジックをドメイン層に集約し、型で不正な状態を防ぐ。

## ディレクトリ構造

フラット構成（小〜中規模向け）。ファイルが増えたら分割。

```
apps/api/src/domain/
├── user.ts              # Entity
├── account.ts           # Entity
├── email.ts             # Value Object
└── transfer-service.ts  # ドメインサービス
```

## Value Object

値で識別される不変オブジェクト。Branded Type で型安全に。

```ts
// domain/email.ts

type Email = string & { readonly brand: unique symbol }

export const Email = {
  create: (value: string): Result<Email, AppError> => {
    if (!value.includes('@')) {
      return err(appError('VALIDATION_ERROR', 'Invalid email'))
    }
    return ok(value as Email)
  },
}
```

**特徴**:
- 生成時にバリデーション
- 不正な値は型レベルで作れない
- `string` と互換性がないため誤用を防ぐ

## Entity

ID で識別されるオブジェクト。不変オブジェクト + 変更関数のパターン。

```ts
// domain/user.ts

export type User = {
  readonly id: string
  readonly email: Email
  readonly name: string
  readonly createdAt: Date
}

export const User = {
  create: (props: { email: Email; name: string }): User => ({
    id: crypto.randomUUID(),
    email: props.email,
    name: props.name,
    createdAt: new Date(),
  }),

  changeName: (user: User, newName: string): User => ({
    ...user,
    name: newName,
  }),
}
```

**特徴**:
- `readonly` で不変性を保証
- 変更は新しいオブジェクトを返す（イミュータブル）
- ビジネスルールを Entity に集約

## ドメインサービス

複数 Entity にまたがるビジネスロジック。

```ts
// domain/transfer-service.ts

type TransferDeps = {
  accountRepo: AccountRepo
}

export const createTransferService = (deps: TransferDeps) => ({
  transfer: async (
    fromId: string,
    toId: string,
    amount: number
  ): Promise<Result<void, AppError>> => {
    const from = await deps.accountRepo.findById(fromId)
    const to = await deps.accountRepo.findById(toId)

    if (!from || !to) {
      return err(appError('NOT_FOUND', 'Account not found'))
    }
    if (from.balance < amount) {
      return err(appError('VALIDATION_ERROR', 'Insufficient balance'))
    }

    // 複数Entityにまたがるビジネスロジック
    const updatedFrom = Account.withdraw(from, amount)
    const updatedTo = Account.deposit(to, amount)

    await deps.accountRepo.save(updatedFrom)
    await deps.accountRepo.save(updatedTo)

    return ok(undefined)
  },
})
```

**使い分け**:
- 単一 Entity のロジック → Entity のメソッド
- 複数 Entity にまたがる → ドメインサービス

## テスト

ドメイン層は純粋関数のためモック不要。最も高速にテストできる。

```ts
// test/domain/user.test.ts

describe('Email', () => {
  test('有効なメールアドレスを受け入れる', () => {
    const result = Email.create('test@example.com')
    expect(result.ok).toBe(true)
  })

  test('@がないと失敗', () => {
    const result = Email.create('invalid')
    expect(result.ok).toBe(false)
  })
})

describe('User', () => {
  test('名前を変更できる', () => {
    const email = Email.create('a@b.com')
    if (!email.ok) throw new Error()

    const user = User.create({ email: email.value, name: 'Alice' })
    const updated = User.changeName(user, 'Bob')

    expect(updated.name).toBe('Bob')
    expect(updated.id).toBe(user.id)  // IDは不変
  })
})
```

## メリット

- **型安全**: 不正な状態をコンパイル時に防ぐ
- **テスト容易**: 純粋関数、モック不要
- **再利用性**: フレームワーク非依存

## 関連

- [Result型](/tech-stack/patterns/01-result) - エラーハンドリング
- [リポジトリ層](/tech-stack/patterns/03-repository) - データアクセスの抽象化
- [ユースケース層](/tech-stack/patterns/18-usecase) - ドメインを呼び出すアプリケーション層
