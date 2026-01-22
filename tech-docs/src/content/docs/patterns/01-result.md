---
title: Result型
description: 例外を使わないエラーハンドリング
---

`ok/err` パターンで型安全にエラーを表現。

## 実装

```ts
// packages/shared/result.ts

type Ok<T> = {
  ok: true
  value: T
}

type Err<E> = {
  ok: false
  error: E
}

export type Result<T, E = Error> = Ok<T> | Err<E>

export const ok = <T>(value: T): Ok<T> => ({ ok: true, value })
export const err = <E>(error: E): Err<E> => ({ ok: false, error })
export const isOk = <T, E>(result: Result<T, E>): result is Ok<T> => result.ok
export const isErr = <T, E>(result: Result<T, E>): result is Err<E> => !result.ok
```

## 使用例

### API側

```ts
const getUser = async (id: string): Promise<Result<User, AppError>> => {
  const user = await repo.findById(id)
  if (!user) {
    return err(appError('NOT_FOUND', 'User not found'))
  }
  return ok(user)
}
```

### フロント側

```tsx
const UserListContainer = () => {
  const { data: result } = useSuspenseQuery({
    queryKey: ['users'],
    queryFn: () => fetchUsers(),
  })

  if (!result.ok) {
    return <ErrorView error={result.error} />
  }

  return <UserListPresentation users={result.value} />
}
```

## メリット

- **型でエラーを表現**: コンパイル時にエラーハンドリング漏れを検出
- **呼び出し側でハンドリング強制**: 結果を使う前に分岐が必要
- **try-catch不要**: ネストが減り、フローが明確

## AppError

Result型と組み合わせて使うエラー型。

```ts
// packages/shared/error.ts

export type AppErrorCode =
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'INTERNAL_ERROR'

export type AppError = {
  code: AppErrorCode
  message: string
  details?: Record<string, unknown>
}

export const appError = (
  code: AppErrorCode,
  message: string,
  details?: Record<string, unknown>
): AppError => ({ code, message, details })
```
