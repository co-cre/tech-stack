---
title: 環境分離
description: dev/stg/prod環境の分離と管理
---

開発・ステージング・本番環境を適切に分離。

## 方針

- 環境ごとにCloudflareプロジェクトを分離
- 設定は環境変数で切り替え
- 本番に近い構成でステージング

## 環境一覧

| 環境 | 用途 | URL |
|------|------|-----|
| development | ローカル開発 | localhost |
| staging | リリース前確認 | staging.example.com |
| production | 本番 | example.com |

## Cloudflare構成

### Workers

```
myapp-api-staging   # ステージング
myapp-api           # 本番
```

### Pages

```
myapp-web-staging   # ステージング
myapp-web           # 本番
```

### D1

```
myapp-db-staging    # ステージング
myapp-db            # 本番
```

## wrangler.toml

```toml
name = "myapp-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[vars]
ENVIRONMENT = "production"

[[d1_databases]]
binding = "DB"
database_name = "myapp-db"
database_id = "xxxx-prod"

# ステージング環境
[env.staging]
name = "myapp-api-staging"

[env.staging.vars]
ENVIRONMENT = "staging"

[[env.staging.d1_databases]]
binding = "DB"
database_name = "myapp-db-staging"
database_id = "xxxx-staging"
```

## デプロイ

```bash
# ステージング
wrangler deploy --env staging

# 本番
wrangler deploy
```

## 環境変数

### ローカル（.dev.vars）

```bash
# apps/api/.dev.vars
ENVIRONMENT=development
JWT_SECRET=dev-secret
```

### ステージング

```bash
wrangler secret put JWT_SECRET --env staging
```

### 本番

```bash
wrangler secret put JWT_SECRET
```

## フロントエンド

### 環境別ビルド

```json
// apps/web/package.json
{
  "scripts": {
    "build": "vite build",
    "build:staging": "vite build --mode staging",
    "build:production": "vite build --mode production"
  }
}
```

### 環境変数ファイル

```bash
# apps/web/.env.development
VITE_API_URL=http://localhost:8787
VITE_ENVIRONMENT=development

# apps/web/.env.staging
VITE_API_URL=https://staging-api.example.com
VITE_ENVIRONMENT=staging

# apps/web/.env.production
VITE_API_URL=https://api.example.com
VITE_ENVIRONMENT=production
```

## CI/CD（GitHub Actions）

```yaml
# .github/workflows/deploy.yml

name: Deploy

on:
  push:
    branches: [main, staging]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1

      - run: bun install
      - run: bun run build

      # ステージング
      - if: github.ref == 'refs/heads/staging'
        run: wrangler deploy --env staging
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CF_API_TOKEN }}

      # 本番
      - if: github.ref == 'refs/heads/main'
        run: wrangler deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CF_API_TOKEN }}
```

## ブランチ戦略

```
main        → 本番環境に自動デプロイ
staging     → ステージング環境に自動デプロイ
feature/*   → 開発（ローカルのみ）
```

## 環境ごとの設定

### API

```ts
// apps/api/src/config.ts

type Environment = 'development' | 'staging' | 'production'

const config = {
  development: {
    logLevel: 'debug',
    corsOrigins: ['http://localhost:5173'],
  },
  staging: {
    logLevel: 'info',
    corsOrigins: ['https://staging.example.com'],
  },
  production: {
    logLevel: 'warn',
    corsOrigins: ['https://example.com'],
  },
}

export const getConfig = (env: Environment) => config[env]
```

### 使用例

```ts
// apps/api/src/index.ts

app.use('/api/*', (c, next) => {
  const config = getConfig(c.env.ENVIRONMENT)
  const corsMiddleware = cors({ origin: config.corsOrigins })
  return corsMiddleware(c, next)
})
```

## 注意点

- ステージングDBに本番データを入れない
- 本番シークレットをステージングで使い回さない
- ステージングでテストしてから本番デプロイ

## 関連

- [ローカルセットアップ](/guides/04-local-setup)
- [シークレット管理](/security/01-secrets)
