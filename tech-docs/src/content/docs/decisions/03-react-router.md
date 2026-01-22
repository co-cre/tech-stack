---
title: "ADR: React Router採用"
description: SPAルーティングにReact Routerを採用
---

## ステータス

採用済み

## コンテキスト

Reactアプリケーションのルーティングライブラリを選定する必要があった。

## 決定

**React Router**を採用する。zodと組み合わせて型安全なパラメータ取得を実現。

## 理由

- Reactのデファクトスタンダード
- 安定したエコシステム
- Suspense対応
- シンプルなAPI

## 検討した代替案

| 技術 | 不採用理由 |
|------|-----------|
| TanStack Router | 型安全だが新しく、エコシステムが小さい |
| Wouter | 機能が限定的 |
| Next.js (App Router) | フルスタックフレームワーク、Viteと相性が悪い |

## 補足

React Router単体ではURLパラメータに型がつかないため、zodと自前フックで型安全性を確保。

```ts
// 型付きパラメータ取得
const { userId } = useTypedParams(userParamsSchema)
const { page } = useTypedSearchParams(paginationSchema)
```

詳細は[実装パターン: URLパラメータ](/tech-stack/patterns/05-url-params/)を参照。
