# Event Ticket

イベントチケット販売アプリ MVP

## 技術スタック

| 領域 | 技術 |
|------|------|
| フロントエンド | React + TypeScript + Vite + Tailwind CSS + shadcn/ui |
| バックエンド | Hono + Drizzle + Bun |
| インフラ | Cloudflare Workers + D1 + Pages |
| 認証 | Firebase Auth |
| 決済 | Stripe |

## 構成

```
event-ticket/
├── apps/
│   ├── web/          # フロントエンド（React + Vite）
│   └── api/          # バックエンド（Hono + Cloudflare Workers）
└── packages/
    └── db/           # データベーススキーマ（Drizzle）
```

## セットアップ

### 1. 依存関係インストール

```bash
bun install
```

### 2. Firebase設定

1. [Firebase Console](https://console.firebase.google.com/) でプロジェクト作成
2. Authentication を有効化（Email/Password）
3. サービスアカウントキーを生成

### 3. Stripe設定

1. [Stripe Dashboard](https://dashboard.stripe.com/) でアカウント作成
2. テスト用APIキーを取得
3. Webhook エンドポイントを設定

### 4. 環境変数設定

**apps/web/.env:**
```
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx
```

**apps/api/.dev.vars:**
```
FIREBASE_PROJECT_ID=xxx
FIREBASE_CLIENT_EMAIL=xxx
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### 5. D1データベース作成

```bash
cd apps/api
wrangler d1 create event-ticket
# wrangler.toml の database_id を更新

# マイグレーション
cd ../../packages/db
bun run generate
wrangler d1 migrations apply event-ticket --local
```

### 6. シードデータ投入（任意）

```bash
wrangler d1 execute event-ticket --local --file=./packages/db/seed.sql
```

## 開発

```bash
# API + Web を起動
bun dev

# API のみ
bun dev:api

# Web のみ
bun dev:web
```

### Stripe Webhook テスト

```bash
stripe listen --forward-to localhost:8787/webhooks/stripe
```

## デプロイ

### Cloudflare Workers (API)

```bash
cd apps/api

# Secrets設定
wrangler secret put FIREBASE_PROJECT_ID
wrangler secret put FIREBASE_CLIENT_EMAIL
wrangler secret put FIREBASE_PRIVATE_KEY
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET

# D1マイグレーション
wrangler d1 migrations apply event-ticket

# デプロイ
wrangler deploy
```

### Cloudflare Pages (Web)

```bash
cd apps/web
bun run build
# dist/ を Cloudflare Pages にデプロイ
```

## API一覧

| メソッド | パス | 説明 |
|---------|------|------|
| POST | /auth/sync | ユーザー同期 |
| GET | /auth/me | 現在ユーザー |
| GET | /events | イベント一覧 |
| GET | /events/:id | イベント詳細 |
| POST | /orders | 注文作成 |
| GET | /orders | 購入履歴 |
| GET | /tickets | 保有チケット |
| GET | /tickets/:id | チケット詳細 |
| POST | /tickets/verify | 入場確認 |
| POST | /webhooks/stripe | Stripe Webhook |

## ライセンス

MIT
