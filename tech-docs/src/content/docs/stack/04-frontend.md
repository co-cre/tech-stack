---
title: フロントエンド
description: ルーティング、状態管理、フォーム、スタイリング
---

| 項目 | 選定 | 備考 |
|------|------|------|
| ルーティング | React Router + zod | 自前フックで型付け |
| 状態管理 | React Query + useState | Suspense統合 |
| フォーム | react-hook-form + zod | shadcn/uiと相性良い |
| CSS | Tailwind | - |
| UIコンポーネント | shadcn/ui | - |
| 日付 | date-fns | 関数型、Tree-shaking |

## React Router

Reactのデファクトスタンダードルーター。

**選定理由**
- 安定したエコシステム
- Suspense対応
- zodと組み合わせて型安全に

## React Query (TanStack Query)

サーバー状態管理ライブラリ。

**選定理由**
- キャッシュ管理が優秀
- Suspense統合
- 楽観的更新のサポート

**検討した代替案**

| 技術 | 不採用理由 |
|------|-----------|
| SWR | 機能が限定的 |
| Redux Toolkit Query | Reduxが不要な場合は過剰 |

## shadcn/ui

Radix UIベースのコンポーネントコレクション。

**選定理由**
- コピー&ペースト方式でカスタマイズ自由
- Tailwind統合
- アクセシビリティ対応

**検討した代替案**

| 技術 | 不採用理由 |
|------|-----------|
| MUI | 重い、カスタマイズしにくい |
| Chakra UI | デザイントークンが異なる |
| Radix UI直接 | 組み合わせの手間 |

## date-fns

関数型の日付操作ライブラリ。

**選定理由**
- Tree-shaking対応
- 関数型で使いやすい
- 軽量

**検討した代替案**

| 技術 | 不採用理由 |
|------|-----------|
| Day.js | 機能は十分だがdate-fnsの方が馴染み深い |
| Moment.js | 非推奨、重い |
