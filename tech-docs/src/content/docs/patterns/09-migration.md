---
title: マイグレーション
description: Drizzleを使ったDBスキーマ管理
---

## 概要

DrizzleのマイグレーションでDBスキーマをコード管理する。

## スキーマ定義

```typescript
// src/db/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const posts = sqliteTable('posts', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content'),
  authorId: text('author_id')
    .notNull()
    .references(() => users.id),
});
```

## マイグレーション生成

```bash
# スキーマ変更からマイグレーションファイル生成
bunx drizzle-kit generate

# 出力先: drizzle/0001_xxx.sql
```

## マイグレーション適用

### ローカル (D1)

```bash
# ローカルD1に適用
bunx wrangler d1 migrations apply DB --local
```

### 本番 (D1)

```bash
# 本番D1に適用
bunx wrangler d1 migrations apply DB --remote
```

## drizzle.config.ts

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
});
```

## ベストプラクティス

- **スキーマファースト**: まずTypeScriptでスキーマ定義、そこからマイグレーション生成
- **小さな変更**: 1マイグレーション = 1変更（複数テーブル同時変更は避ける）
- **ロールバック考慮**: 破壊的変更は段階的に（カラム削除前に非推奨期間を設ける）
- **CI連携**: PRでマイグレーションファイルの差分レビュー

## 関連

- [Drizzle](/tech-stack/stack/03-api#drizzle)
- [ADR: Drizzle採用](/tech-stack/decisions/07-drizzle)
