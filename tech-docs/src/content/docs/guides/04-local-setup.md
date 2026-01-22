---
title: ローカルセットアップ
description: 開発環境の構築手順
---

新しいメンバーが開発を始めるまでの手順。

## 前提条件

- macOS / Linux / WSL2
- Bun 1.x
- Git
- Cloudflare アカウント（Wrangler用）

## セットアップ手順

### 1. リポジトリのクローン

```bash
git clone git@github.com:myorg/myapp.git
cd myapp
```

### 2. 依存関係のインストール

```bash
bun install
```

### 3. 環境変数の設定

```bash
# ルートディレクトリ
cp .env.example .env

# 各アプリ
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

必要に応じて `.env` を編集。

### 4. データベースのセットアップ

**D1（ローカル）**

```bash
# マイグレーション実行
cd apps/api
bun run db:migrate
```

**PostgreSQL（ローカル）**

```bash
# Docker Compose で起動
docker compose up -d postgres

# マイグレーション実行
cd apps/api
bun run db:migrate
```

### 5. 開発サーバー起動

```bash
# ルートディレクトリから全サービス起動
bun dev
```

または個別に：

```bash
# API
cd apps/api && bun dev

# Web
cd apps/web && bun dev
```

### 6. 動作確認

- API: http://localhost:8787
- Web: http://localhost:5173
- API ヘルスチェック: http://localhost:8787/health

## プロジェクト構成

```
myapp/
├── apps/
│   ├── api/          # Hono (Cloudflare Workers)
│   └── web/          # React Router
├── packages/
│   └── shared/       # 共通コード
├── package.json      # ワークスペース設定
└── turbo.json        # Turborepo設定
```

## よく使うコマンド

```bash
# 開発サーバー
bun dev

# ビルド
bun build

# 型チェック
bun typecheck

# リント
bun lint

# テスト
bun test

# DBマイグレーション
bun run db:migrate

# DBシード
bun run db:seed
```

## Wrangler設定

初回のみ：

```bash
# Cloudflareにログイン
wrangler login

# D1データベース作成（必要な場合）
wrangler d1 create mydb
```

## トラブルシューティング

### ポートが使用中

```bash
# ポート確認
lsof -i :8787
lsof -i :5173

# プロセス終了
kill -9 <PID>
```

### node_modules の問題

```bash
rm -rf node_modules
rm bun.lockb
bun install
```

### D1のリセット

```bash
rm -rf .wrangler
bun run db:migrate
```

### 型エラー

```bash
# 型定義の再生成
bun run typecheck
```

## エディタ設定

### VS Code 推奨拡張

```json
// .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss"
  ]
}
```

### 設定

```json
// .vscode/settings.json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

## 関連

- [環境分離](/guides/05-env-separation)
- [テスト方針](/patterns/07-testing)
