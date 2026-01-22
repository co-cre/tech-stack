---
title: コア技術
description: ランタイム、モノレポ、API、フロント、ORMの選定
---

| 項目 | 選定 | 備考 |
|------|------|------|
| ランタイム/パッケージ | Bun | 速い。pnpmより速い |
| モノレポ | Bun workspaces | Turborepo/Nx入れない |
| API | Hono | Web標準、軽量 |
| フロント | Vite + React | ビルドとUIを分離 |
| ORM | Drizzle | 型安全、軽量 |

## Bun

Node.js互換の高速JavaScriptランタイム。パッケージマネージャ、バンドラ、テストランナーを内蔵。

**選定理由**
- pnpmより高速なインストール
- ネイティブTypeScriptサポート
- 内蔵テストランナー（Jest互換）

## Hono

Web標準に準拠した軽量Webフレームワーク。

**選定理由**
- Web標準API（Request/Response）
- Cloudflare Workers対応
- RPC機能で型安全なクライアント生成

**検討した代替案**

| 技術 | 不採用理由 |
|------|-----------|
| Express | Web標準ではない |
| Fastify | Cloudflare Workers非対応 |
| tRPC | Honoより複雑 |

## Drizzle

型安全で軽量なTypeScript ORM。

**選定理由**
- 型推論が強力
- SQLに近い記法
- D1対応

**検討した代替案**

| 技術 | 不採用理由 |
|------|-----------|
| Prisma | ランタイムが重い |
| Kysely | 機能が限定的 |
