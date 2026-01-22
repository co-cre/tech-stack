---
title: 必要になったら足す
description: 辛くなったら導入を検討する技術
---

「最初から入れない。辛くなったら足す」の原則に基づき、以下は必要になってから導入。

| 状況 | 追加 |
|------|------|
| クライアント状態が複雑に | Jotai |
| 外部API公開 | @hono/zod-openapi |
| CFワーカー固有テスト | Vitest + @cloudflare/vitest-pool-workers |
| ビルド最適化が必要 | Turborepo |
| Web標準フォームに寄せたい | conform |

## Jotai

グローバルな状態管理が必要になったら。

**導入タイミング**
- useStateのバケツリレーが深くなった
- 複数コンポーネント間で状態共有が必要

**React Queryとの使い分け**
- サーバー状態: React Query
- クライアント状態: Jotai

## @hono/zod-openapi

外部向けAPIドキュメントが必要になったら。

**導入タイミング**
- 外部開発者向けAPI公開
- Swagger UIが欲しい

## Turborepo

モノレポのビルド最適化が必要になったら。

**導入タイミング**
- パッケージ数が増えてビルドが遅い
- キャッシュによる高速化が必要

**Bun workspacesで十分なケース**
- パッケージ数が少ない（〜5個程度）
- ビルド時間が許容範囲

## conform

React Hook Formからの移行候補。

**導入タイミング**
- プログレッシブエンハンスメントが必要
- サーバーアクション対応
