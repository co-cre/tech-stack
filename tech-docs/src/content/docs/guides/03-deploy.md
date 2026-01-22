---
title: デプロイ先選定
description: プロジェクト要件に応じたデプロイ先の選び方
---

## デフォルト: Cloudflare

特別な理由がなければCloudflareを選択。

## 比較表

| | Cloudflare | GCP (Cloud Run) | Vercel |
|--|------------|-----------------|--------|
| エッジ | ○ | △ | ○ |
| 複雑な処理 | △ | ○ | △ |
| 実行時間制限 | 30秒〜 | 60分 | 10秒〜 |
| コスト | 安い | 従量課金 | 従量課金 |
| DB | D1, KV | CloudSQL, Firestore | - |
| 構成 | シンプル | 柔軟 | シンプル |

## 選定フローチャート

```
重い処理が必要？
├─ Yes → GCP (Cloud Run)
└─ No
    └─ エッジで動かしたい？
        ├─ Yes → Cloudflare
        └─ No → どちらでも
```

## Cloudflareが向いているケース

- シンプルなAPIサーバー
- 静的サイト + API
- グローバル配信（CDN必須）
- コスト重視

**構成例**
- Cloudflare Pages: フロントエンド
- Cloudflare Workers: API
- D1: データベース
- KV: キャッシュ

## GCPが向いているケース

- 重いバッチ処理
- 長時間実行タスク
- PostgreSQLが必要
- 既存GCPリソースとの統合

**構成例**
- Cloud Run: API
- CloudSQL: データベース
- Cloud Storage: ファイル

## Vercelが向いているケース

- Next.jsアプリケーション
- ISR/SSGを活用したい
- Vercel固有機能（Analytics等）を使いたい

## 注意点

**Cloudflareの制限**
- CPU時間制限あり（Workersプランによる）
- Node.js APIの一部が使えない
- WebSocket接続数に制限

**GCPの考慮事項**
- コールドスタートがある
- 料金体系が複雑
- リージョン選択が必要
