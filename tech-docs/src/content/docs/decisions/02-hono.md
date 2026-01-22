---
title: "ADR: Hono採用"
description: APIフレームワークとしてHonoを採用
---

## ステータス

採用済み

## コンテキスト

バックエンドAPIフレームワークを選定する必要があった。Cloudflare Workersでの動作が要件。

## 決定

**Hono**を採用する。

## 理由

- Web標準API（Request/Response）を使用
- Cloudflare Workers完全対応
- 軽量（バンドルサイズが小さい）
- RPC機能でフロントエンドと型共有可能
- ミドルウェアエコシステム充実

## 検討した代替案

| 技術 | 不採用理由 |
|------|-----------|
| Express | Web標準ではない、Workers非対応 |
| Fastify | Cloudflare Workers非対応 |
| tRPC | Honoより複雑、学習コスト高い |
| NestJS | 重い、デコレータ多用 |

## 影響

- Hono RPCでフロントエンドと型安全な通信
- Web標準のRequest/Responseを扱う
- エッジランタイムでの動作保証
