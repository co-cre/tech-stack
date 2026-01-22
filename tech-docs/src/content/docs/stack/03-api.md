---
title: API
description: バックエンド技術スタック
---

## 一覧

| 技術 | 用途 | 選定理由 |
|------|------|----------|
| Hono | APIフレームワーク | [→ 詳細](/tech-stack/decisions/02-hono) |
| Drizzle | ORM | 型安全、軽量 |
| D1 | データベース | Cloudflare統合 |

## Hono

Web標準APIベースの軽量フレームワーク。Cloudflare Workers、Bun、Node.jsなど様々な環境で動作。

```typescript
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';

const app = new Hono();

app.get('/users/:id', async (c) => {
  const id = c.req.param('id');
  // ...
});

app.post('/users', zValidator('json', CreateUserSchema), async (c) => {
  const data = c.req.valid('json');
  // ...
});
```

**特徴**:
- Web標準の Request/Response
- TypeScript ファースト
- RPC機能でフロントエンドとの型共有

**関連パターン**: [レスポンス](/tech-stack/patterns/02-api-response)、[リポジトリ層](/tech-stack/patterns/03-repository)

## Drizzle

TypeScript製の軽量ORM。SQLに近い記法で型安全なクエリを記述。

```typescript
import { eq } from 'drizzle-orm';

// 型安全なクエリ
const users = await db.select().from(usersTable).where(eq(usersTable.id, id));
```

**特徴**:
- スキーマからTypeScript型を自動生成
- マイグレーション管理
- 複数DB対応（D1, Turso, PostgreSQL等）

## D1

Cloudflare のエッジSQLiteデータベース。Workers と統合されており、グローバルに分散配置。

**選定ガイド**: [DB選定](/tech-stack/guides/01-db)
