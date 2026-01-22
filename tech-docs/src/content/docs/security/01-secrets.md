---
title: シークレット管理
description: Cloudflare Secretsと環境変数の管理
---

シークレットを安全に管理し、コードに含めない。

## 方針

- シークレットは環境変数で注入
- `.env` はGitにコミットしない
- 本番はCloudflare Secretsを使用

## ローカル開発

```bash
# .env.example（コミット可）
DATABASE_URL=
JWT_SECRET=
EXTERNAL_API_KEY=
```

```bash
# .env（.gitignore）
DATABASE_URL=postgresql://localhost:5432/myapp
JWT_SECRET=dev-secret-key
EXTERNAL_API_KEY=xxx
```

```ts
// wrangler.toml
[vars]
ENVIRONMENT = "development"

# シークレットはwrangler.tomlに書かない
```

## 1Password CLI（推奨）

`.env`ファイルを作らず、1Password CLIでシークレットを直接注入する。

### セットアップ

```bash
# macOS
brew install --cask 1password-cli

# ログイン
op signin
```

### .env.example に参照形式で記載

```bash
# .env.example（コミット可）
DATABASE_URL=op://Development/myapp-db/url
JWT_SECRET=op://Development/myapp-secrets/jwt-secret
EXTERNAL_API_KEY=op://Development/external-api/credential
```

`op://vault/item/field` 形式で1Password内のアイテムを参照。

### op run で起動

```bash
# 環境変数を注入して実行
op run --env-file=.env.example -- bun dev

# 複数サービス
op run --env-file=.env.example -- turbo dev
```

`.env`ファイルが不要。シークレットがディスクに残らない。

### package.json スクリプト

```json
{
  "scripts": {
    "dev": "op run --env-file=.env.example -- turbo dev",
    "db:migrate": "op run --env-file=.env.example -- drizzle-kit migrate"
  }
}
```

### チーム共有

1. 1Password Business/Teams で共有vault作成
2. 必要なシークレットをvaultに格納
3. チームメンバーをvaultに招待
4. 全員が同じ `.env.example` で開発可能

### 1Password vs .env

| 項目 | 1Password CLI | .env |
|------|--------------|------|
| ファイル管理 | 不要 | 必要 |
| チーム共有 | vault共有で即同期 | 手動コピー |
| ローテーション | 1Password更新で全員反映 | 各自更新 |
| セキュリティ | ディスクに残らない | 平文ファイル |

## Cloudflare Workers

### Secrets設定

```bash
# シークレットを設定
wrangler secret put JWT_SECRET
wrangler secret put DATABASE_URL
wrangler secret put EXTERNAL_API_KEY

# 確認
wrangler secret list
```

### 環境ごとの設定

```bash
# staging
wrangler secret put JWT_SECRET --env staging

# production
wrangler secret put JWT_SECRET --env production
```

### 型定義

```ts
// apps/api/src/types.ts

export type Env = {
  // 環境変数（wrangler.toml [vars]）
  ENVIRONMENT: 'development' | 'staging' | 'production'

  // シークレット
  JWT_SECRET: string
  DATABASE_URL: string
  EXTERNAL_API_KEY: string

  // Bindings
  DB: D1Database
  KV: KVNamespace
}
```

### 使用例

```ts
// apps/api/src/index.ts

import { Hono } from 'hono'
import type { Env } from './types'

const app = new Hono<{ Bindings: Env }>()

app.get('/health', (c) => {
  const env = c.env.ENVIRONMENT
  return c.json({ status: 'ok', env })
})

app.post('/auth', async (c) => {
  const token = await sign(payload, c.env.JWT_SECRET)
  return c.json({ token })
})
```

## やってはいけないこと

```ts
// NG: ハードコーディング
const API_KEY = 'sk-xxxx'

// NG: console.logで出力
console.log('JWT_SECRET:', c.env.JWT_SECRET)

// NG: エラーメッセージに含める
throw new Error(`Failed with key: ${c.env.API_KEY}`)

// NG: レスポンスに含める
return c.json({ secret: c.env.JWT_SECRET })
```

## シークレットのローテーション

```bash
# 1. 新しいシークレットを設定
wrangler secret put JWT_SECRET_NEW

# 2. 両方のシークレットを受け入れるようコードを更新

# 3. デプロイ

# 4. 古いシークレットを削除
wrangler secret delete JWT_SECRET
```

## チェックリスト

- [ ] `.env` が `.gitignore` に含まれている
- [ ] `.env.example` が存在する
- [ ] 本番シークレットはCloudflare Secretsで管理
- [ ] コード内にハードコードされたシークレットがない
- [ ] ログにシークレットが出力されていない

## 関連

- [環境変数パターン](/patterns/04-env)
- [環境分離](/guides/05-env-separation)
