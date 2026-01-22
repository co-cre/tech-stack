---
title: インフラ
description: デプロイ・ホスティング基盤
---

## 選定方針

**Cloudflare** または **GCP** に統一する。

| 条件 | 選択 | 理由 |
|------|------|------|
| 小規模・シンプルなアプリ | Cloudflare | 費用が安い |
| スケール不要 | Cloudflare | 運用シンプル |
| エンタープライズ案件 | GCP | 顧客要件 |
| 顧客がクラウドを指定 | GCP | 信頼性・サポート |

**詳細**: [デプロイ選定ガイド](/tech-stack/guides/03-deploy)

---

## Cloudflare

小〜中規模向け。エッジコンピューティングで高速・低コスト。

### 一覧

| 技術 | 用途 |
|------|------|
| Workers | APIホスティング |
| Pages | フロントエンドホスティング |
| D1 | SQLiteデータベース |
| R2 | オブジェクトストレージ |
| KV | キーバリューストア |
| Wrangler | デプロイCLI |

### Workers

エッジで動作するサーバーレス環境。Web標準API（Request/Response）。

```toml
# wrangler.toml
name = "api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "mydb"
database_id = "xxx"
```

**特徴**: コールドスタートなし、0ms起動、グローバルエッジ配信

### Pages

静的サイト・SPAホスティング。GitHub連携で自動デプロイ。

**特徴**: PRごとプレビュー、無制限帯域、Workers統合可能

### D1

エッジ SQLite データベース。

**選定ガイド**: [DB選定](/tech-stack/guides/01-db)

### R2

S3互換オブジェクトストレージ。**egress無料**。

### KV

グローバル分散キーバリューストア。読み取り高速、結果整合性。

**用途**: セッション、キャッシュ、設定値

### Wrangler

```bash
bunx wrangler dev              # ローカル開発
bunx wrangler deploy           # デプロイ
bunx wrangler d1 migrations apply DB --local   # マイグレーション
```

---

## GCP (Google Cloud Platform)

エンタープライズ向け。フルマネージド・高可用性。

### 一覧

| 技術 | 用途 |
|------|------|
| Cloud Run | APIホスティング |
| Cloud Storage | 静的サイト / オブジェクトストレージ |
| Cloud SQL | PostgreSQL / MySQL |
| Firestore | NoSQLデータベース |
| Cloud CDN | CDN |
| Secret Manager | シークレット管理 |
| Cloud Build | CI/CD |

### Cloud Run

フルマネージドコンテナ実行環境。Dockerイメージをデプロイ。

```dockerfile
# Dockerfile
FROM oven/bun:1 AS base
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile
COPY . .
CMD ["bun", "run", "src/index.ts"]
```

```bash
# デプロイ
gcloud run deploy api \
  --source . \
  --region asia-northeast1 \
  --allow-unauthenticated
```

**特徴**: オートスケール、従量課金、VPC接続可能

### Cloud SQL

フルマネージドRDB（PostgreSQL / MySQL）。

**特徴**: 自動バックアップ、高可用性、Private IP接続

### Cloud Storage

オブジェクトストレージ。静的サイトホスティングも可能。

### Firestore

サーバーレスNoSQL。リアルタイム同期対応。

### Secret Manager

APIキー・認証情報の安全な管理。

```typescript
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();
const [version] = await client.accessSecretVersion({
  name: 'projects/xxx/secrets/api-key/versions/latest',
});
const secret = version.payload?.data?.toString();
```

---

## 関連

- [デプロイ選定ガイド](/tech-stack/guides/03-deploy)
- [DB選定ガイド](/tech-stack/guides/01-db)
- [マイグレーション](/tech-stack/patterns/09-migration)
