---
title: switch網羅性チェック
description: Union型の全caseをswitchで強制的にハンドリング
---

ESLint `switch-exhaustiveness-check` でUnion型の分岐漏れを防ぐ。

## 問題

Union型にcaseが追加されても、switchの分岐漏れに気づけない。

```ts
type Status = 'pending' | 'approved' | 'rejected'

const getLabel = (status: Status): string => {
  switch (status) {
    case 'pending': return '審査中'
    case 'approved': return '承認済'
    case 'rejected': return '却下'
  }
}

// 後から 'cancelled' が追加されたら？
type Status = 'pending' | 'approved' | 'rejected' | 'cancelled'

// このswitchは 'cancelled' をハンドリングしていないが、
// TypeScript単体ではエラーにならない（undefinedを返すだけ）
```

## 解決策: ESLint switch-exhaustiveness-check

```ts
// ESLintエラー: Switch is not exhaustive. Cases not matched: "cancelled"
switch (status) {
  case 'pending': return '審査中'
  case 'approved': return '承認済'
  case 'rejected': return '却下'
}
```

### 設定

```js
// eslint.config.js
import tseslint from 'typescript-eslint'

export default tseslint.config({
  rules: {
    '@typescript-eslint/switch-exhaustiveness-check': 'error',
  },
})
```

## メリット

| 観点 | 効果 |
|------|------|
| 型追加時の検出 | 新ステータス追加で全switchが警告される |
| リファクタリング | ステータスの削除・追加が安全 |
| default乱用防止 | 意図しないケースがdefaultに落ちない |

## 代替手法: never型によるフォールバック

ESLintなしでも、never型を使って網羅性を検証できる。

```ts
const assertNever = (x: never): never => {
  throw new Error(`Unexpected value: ${x}`)
}

const getLabel = (status: Status): string => {
  switch (status) {
    case 'pending': return '審査中'
    case 'approved': return '承認済'
    case 'rejected': return '却下'
    default:
      // 'cancelled' が追加されると、ここでコンパイルエラー
      // Argument of type 'string' is not assignable to parameter of type 'never'
      return assertNever(status)
  }
}
```

### ESLintルール vs never型

| 観点 | ESLintルール | never型 |
|------|-------------|---------|
| セットアップ | ESLint設定が必要 | 不要 |
| 検出タイミング | lint時 | コンパイル時 |
| defaultケース | 書かなくてOK | 必須 |
| ランタイムエラー | なし | throwされる可能性 |

**推奨**: ESLintルールを使用し、never型は補助的に使う。

## 実践例

### APIレスポンスのステータス判別

```ts
type ApiStatus = 'success' | 'error' | 'loading' | 'idle'

const StatusBadge = ({ status }: { status: ApiStatus }) => {
  switch (status) {
    case 'success':
      return <Badge color="green">成功</Badge>
    case 'error':
      return <Badge color="red">エラー</Badge>
    case 'loading':
      return <Badge color="blue">読込中</Badge>
    case 'idle':
      return <Badge color="gray">待機中</Badge>
  }
}
```

### ドメインの状態遷移

```ts
type OrderStatus = 'draft' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

const getNextActions = (status: OrderStatus): Action[] => {
  switch (status) {
    case 'draft':
      return ['confirm', 'cancel']
    case 'confirmed':
      return ['ship', 'cancel']
    case 'shipped':
      return ['deliver']
    case 'delivered':
      return []
    case 'cancelled':
      return []
  }
}
```

### エラーコードのハンドリング

```ts
type ErrorCode = 'NOT_FOUND' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'INTERNAL_ERROR'

const getErrorMessage = (code: ErrorCode): string => {
  switch (code) {
    case 'NOT_FOUND':
      return 'リソースが見つかりません'
    case 'UNAUTHORIZED':
      return 'ログインが必要です'
    case 'FORBIDDEN':
      return 'アクセス権限がありません'
    case 'INTERNAL_ERROR':
      return 'システムエラーが発生しました'
  }
}
```

## defaultケースが必要な場合

外部APIのレスポンスなど、型定義外の値が来る可能性がある場合はdefaultが必要。

```ts
// 外部APIからのレスポンス（型定義外の値が来る可能性）
const handleExternalStatus = (status: string): string => {
  switch (status) {
    case 'active':
      return 'アクティブ'
    case 'inactive':
      return '非アクティブ'
    default:
      // 未知のステータスはログを出して汎用メッセージ
      console.warn(`Unknown status: ${status}`)
      return '不明'
  }
}
```

## 関連リンク

- [typescript-eslint: switch-exhaustiveness-check](https://typescript-eslint.io/rules/switch-exhaustiveness-check/)
- [TypeScript: Narrowing - Exhaustiveness checking](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking)
