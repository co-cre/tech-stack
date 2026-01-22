---
title: インフラ
description: デプロイ・ホスティング基盤
---

## 一覧

| 技術 | 用途 |
|------|------|
| Cloudflare Workers | APIホスティング |
| Cloudflare Pages | フロントエンドホスティング |
| D1 | SQLiteデータベース |
| R2 | オブジェクトストレージ |
| KV | キーバリューストア |
| Wrangler | デプロイCLI |

## Cloudflare Workers

エッジで動作するサーバーレス環境。Web標準API（Request/Response）を使用。

```typescript
// wrangler.toml
name = "api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "mydb"
database_id = "xxx"
```

**特徴**:
- コールドスタートなし
- グローバルエッジ配信
- 0ms起動

## Cloudflare Pages

静的サイト・SPAホスティング。GitHub連携で自動デプロイ。

```bash
# ビルド設定
Build command: bun run build
Build output directory: dist
```

**特徴**:
- プレビューデプロイ（PRごと）
- 無制限帯域
- Workers統合可能

## D1

Cloudflareのエッジ SQLite データベース。

```typescript
// Honoでの使用
app.get('/users', async (c) => {
  const db = drizzle(c.env.DB);
  const users = await db.select().from(usersTable);
  return c.json(users);
});
```

**選定ガイド**: [DB選定](/tech-stack/guides/01-db)

## R2

S3互換のオブジェクトストレージ。egress無料。

```typescript
// ファイルアップロード
app.post('/upload', async (c) => {
  const file = await c.req.blob();
  await c.env.BUCKET.put('files/image.png', file);
  return c.json({ ok: true });
});
```

## KV

グローバル分散キーバリューストア。読み取り高速、書き込みは結果整合性。

```typescript
// セッション保存
await c.env.KV.put(`session:${id}`, JSON.stringify(data), {
  expirationTtl: 86400, // 24時間
});
```

**用途**: セッション、キャッシュ、設定値

## Wrangler

Cloudflare開発・デプロイCLI。

```bash
# ローカル開発
bunx wrangler dev

# デプロイ
bunx wrangler deploy

# D1マイグレーション
bunx wrangler d1 migrations apply DB --local
bunx wrangler d1 migrations apply DB --remote
```

## 関連

- [デプロイ選定ガイド](/tech-stack/guides/03-deploy)
- [マイグレーション](/tech-stack/patterns/09-migration)
