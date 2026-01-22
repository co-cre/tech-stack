# Event Ticket - Claude 開発ガイド

イベントチケット販売アプリ MVP

## 技術スタック

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Hono + Drizzle + Bun
- **Infra**: Cloudflare Workers + D1 + Pages
- **Auth**: Firebase Auth
- **Payment**: Stripe

## ディレクトリ構成

```
event-ticket/
├── apps/
│   ├── web/          # フロントエンド（React + Vite）
│   │   └── src/
│   │       ├── pages/        # ページコンポーネント
│   │       ├── components/   # UIコンポーネント
│   │       └── lib/          # ユーティリティ
│   └── api/          # バックエンド（Hono + Cloudflare Workers）
│       └── src/
│           ├── routes/       # APIルート
│           ├── middleware/   # 認証ミドルウェア
│           └── lib/          # DB・Stripe接続
└── packages/
    └── db/           # データベーススキーマ（Drizzle）
        └── src/schema/
```

## 開発コマンド

```bash
# ルートで実行
bun install          # 依存関係インストール
bun dev              # API + Web 同時起動
bun dev:api          # API のみ
bun dev:web          # Web のみ

# DB マイグレーション
cd packages/db
bun run generate                              # SQL生成
wrangler d1 migrations apply event-ticket --local  # ローカル適用
```

## DBスキーマ（5テーブル）

| テーブル | 説明 |
|---------|------|
| users | Firebase UID と同期 |
| events | イベント情報 |
| ticket_types | チケット種別・価格 |
| orders | 注文（Stripe連携） |
| tickets | 発行済みチケット |

## API エンドポイント

| Method | Path | 認証 | 説明 |
|--------|------|------|------|
| POST | /auth/sync | ○ | ユーザー同期 |
| GET | /auth/me | ○ | 現在ユーザー |
| GET | /events | - | イベント一覧 |
| GET | /events/:id | - | イベント詳細 |
| POST | /orders | ○ | 注文作成（Stripe Checkout） |
| GET | /orders | ○ | 購入履歴 |
| GET | /tickets | ○ | 保有チケット |
| GET | /tickets/:id | ○ | チケット詳細 |
| POST | /tickets/verify | ○ | 入場確認 |
| POST | /webhooks/stripe | - | Stripe Webhook |

## 環境変数

**apps/web/.env:**
- `VITE_FIREBASE_*` - Firebase設定
- `VITE_API_URL` - API URL

**apps/api/.dev.vars:**
- `FIREBASE_*` - サービスアカウント
- `STRIPE_SECRET_KEY` - Stripe秘密鍵
- `STRIPE_WEBHOOK_SECRET` - Webhook署名

## 注意事項

1. **Firebase Admin SDK**: Cloudflare Workers用にカスタム実装（`jose`で署名検証）
2. **Stripe Webhook**: ローカルは `stripe listen --forward-to localhost:8787/webhooks/stripe`
3. **D1 ローカル**: `--local` フラグ必須
4. **認証フロー**: Firebase Auth → IDトークン → API検証 → ユーザー同期
