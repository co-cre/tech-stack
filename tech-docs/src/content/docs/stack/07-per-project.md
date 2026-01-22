---
title: 案件ごとに決めるもの
description: プロジェクト要件に応じて選択する技術
---

以下は案件の要件に応じて選択。

| 項目 | 選択肢 |
|------|--------|
| 認証 | Cloudflare Access / Firebase Auth / Lucia / 自前JWT |
| DB | D1 / CloudSQL / Firestore |
| デプロイ先 | Cloudflare / GCP |
| ロギング/監視 | Sentry / Cloudflare Analytics 等 |

## 認証

詳細は[選定ガイド: 認証](/guides/02-auth/)を参照。

| | Cloudflare Access | Firebase Auth | Lucia | 自前JWT |
|--|-------------------|---------------|-------|---------|
| 向いてる | 社内ツール | 一般向けSaaS | 自由度重視 | 完全制御 |
| 実装コスト | 低 | 低 | 中 | 高 |

## DB

詳細は[選定ガイド: DB](/guides/01-db/)を参照。

| | D1 | CloudSQL | Firestore |
|--|-----|----------|-----------|
| 本質 | SQLite | PostgreSQL | NoSQL |
| 向いてる | 小〜中規模 | 大規模 | リアルタイム |
| デフォルト | ○ | | |

## デプロイ先

| | Cloudflare | GCP |
|--|------------|-----|
| エッジ | ○ | △ |
| 複雑な処理 | △ | ○ |
| コスト | 安い | 従量課金 |

**デフォルト: Cloudflare**

シンプルで安い。エッジで動く。

## ロギング/監視

| | Sentry | Cloudflare Analytics |
|--|--------|---------------------|
| エラー追跡 | ○ | △ |
| パフォーマンス | ○ | ○ |
| コスト | 有料 | 無料〜 |
