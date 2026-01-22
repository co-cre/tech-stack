---
title: コーディング規約
description: AIアシスタントが従うべきコーディングルール
---

このドキュメントはAIアシスタント（Claude、Cursor等）がコードを生成する際に参照するルール集。

## 基本原則

- **Simple over Easy**: 便利より単純を選ぶ
- **必要になったら足す**: 最初から入れない
- **Web標準に寄せる**: 独自APIより標準API
- **IFに対してテスト**: 実装詳細をテストしない

## ファイル構成

```
features/
└── users/
    ├── UserList.tsx              # エントリ（Suspense境界）
    ├── UserList.container.tsx    # データ取得
    ├── UserList.presentation.tsx # UI（純粋関数）
    └── hooks.ts                  # 機能固有フック
```

## TypeScript

```ts
// zodでスキーマ定義 → 型を導出
const userSchema = z.object({
  id: z.string(),
  name: z.string(),
})
type User = z.infer<typeof userSchema>

// Result型でエラーハンドリング
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E }

// 環境変数は起動時にバリデーション
const env = envSchema.parse(process.env)
```

## React

```tsx
// React Queryでサーバー状態管理
const { data } = useSuspenseQuery({
  queryKey: ['users'],
  queryFn: () => api.users.$get().then(r => r.json()),
})

// URLパラメータはzodで型付け
const { userId } = useTypedParams(userParamsSchema)
```

## API (Hono)

```ts
// zodでバリデーション
app.post('/users', zValidator('json', createUserSchema), async (c) => {
  const body = c.req.valid('json')
  const result = await userRepo.create(body)

  if (!result.ok) {
    return errorResponse(c, result.error)
  }
  return okResponse(c, result.value)
})
```

## 禁止事項

- `any`型の使用
- `console.log`の残置（debug時のみ可）
- 未使用import/変数
- マジックナンバー（定数化する）
- try-catchの乱用（Result型を使う）

## 命名規則

| 対象 | 規則 | 例 |
|------|------|-----|
| 変数/関数 | camelCase | `getUserById` |
| 型/クラス | PascalCase | `UserRepository` |
| 定数 | UPPER_SNAKE | `MAX_RETRY_COUNT` |
| ファイル | kebab-case or PascalCase | `user-repo.ts`, `UserList.tsx` |
