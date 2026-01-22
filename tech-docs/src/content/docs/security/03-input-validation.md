---
title: 入力検証
description: SQLインジェクション・XSS対策
---

ユーザー入力は信頼せず、必ず検証する。

## 方針

- すべての入力をZodで検証
- SQLはプリペアドステートメント（Drizzle）
- 出力時のエスケープはReactに任せる

## Zodによる入力検証

### 基本パターン

```ts
// apps/api/src/routes/users.ts

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().int().min(0).max(150).optional(),
})

app.post(
  '/',
  zValidator('json', createUserSchema),
  async (c) => {
    const data = c.req.valid('json') // 型安全
    // ...
  }
)
```

### パスパラメータ

```ts
const idSchema = z.object({
  id: z.string().uuid(),
})

app.get(
  '/:id',
  zValidator('param', idSchema),
  async (c) => {
    const { id } = c.req.valid('param')
    // ...
  }
)
```

### クエリパラメータ

```ts
const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['createdAt', 'name']).default('createdAt'),
})

app.get(
  '/',
  zValidator('query', listSchema),
  async (c) => {
    const { page, limit, sort } = c.req.valid('query')
    // ...
  }
)
```

## SQLインジェクション対策

### Drizzle（安全）

```ts
// Drizzleは自動的にプリペアドステートメントを使用
const users = await db
  .select()
  .from(usersTable)
  .where(eq(usersTable.email, email)) // 安全
```

### 危険なパターン

```ts
// NG: 文字列結合
const query = `SELECT * FROM users WHERE email = '${email}'`

// NG: テンプレートリテラル
await db.execute(sql`SELECT * FROM users WHERE email = ${email}`)
// ↑ Drizzleのsqlタグは安全だが、生SQLは避ける
```

## XSS対策

### Reactの自動エスケープ

```tsx
// Reactは自動的にエスケープする
const UserName = ({ name }: { name: string }) => {
  return <div>{name}</div> // 安全
}
```

### 危険なパターン

```tsx
// NG: dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// NG: URLにユーザー入力
<a href={userProvidedUrl}>リンク</a>
// ↑ javascript: スキームでXSS可能
```

### URLの検証

```ts
const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

// 使用例
const SafeLink = ({ url, children }: { url: string; children: React.ReactNode }) => {
  if (!isValidUrl(url)) {
    return <span>{children}</span>
  }
  return <a href={url}>{children}</a>
}
```

## ファイルアップロード

```ts
const uploadSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.size <= 5 * 1024 * 1024, // 5MB
    'ファイルサイズは5MB以下にしてください'
  ).refine(
    (file) => ['image/jpeg', 'image/png'].includes(file.type),
    'JPEGまたはPNGのみアップロード可能です'
  ),
})
```

## バリデーションエラーレスポンス

```ts
// apps/api/src/lib/validator.ts

import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { appError } from '@myapp/shared'

export const jsonValidator = <T extends z.ZodSchema>(schema: T) => {
  return zValidator('json', schema, (result, c) => {
    if (!result.success) {
      const fields = result.error.issues.reduce(
        (acc, issue) => ({
          ...acc,
          [issue.path.join('.')]: issue.message,
        }),
        {}
      )
      return c.json(
        { ok: false, error: appError('VALIDATION_ERROR', undefined, { fields }) },
        400
      )
    }
  })
}
```

## 関連

- [エラーコード](/patterns/14-error-codes)
- [チェックリスト](/security/04-checklist)
