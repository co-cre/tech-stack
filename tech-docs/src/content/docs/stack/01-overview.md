---
title: 全体像
description: 技術スタックの全体構成
---

## アーキテクチャ

```
┌─────────────────────────────────────────┐
│              Frontend (React)           │
│  React Router + React Query + shadcn/ui │
└────────────────────┬────────────────────┘
                     │ Hono RPC
┌────────────────────▼────────────────────┐
│              Backend (Hono)             │
│         zod validation + Result型       │
└────────────────────┬────────────────────┘
                     │ Drizzle
┌────────────────────▼────────────────────┐
│              Database (D1)              │
└─────────────────────────────────────────┘
```

## 特徴

- **Web標準**: Hono, fetchなどWeb標準APIを活用
- **型安全**: zodでエンドツーエンドの型安全を実現
- **軽量**: 重いフレームワークを避け、必要なものだけ
- **Simple over Easy**: 魔法より理解しやすさを重視

## ディレクトリ構成

```
monorepo/
├── apps/
│   ├── web/                    # フロントエンド（Vite + React）
│   │   ├── src/
│   │   │   ├── features/       # 機能単位
│   │   │   │   └── users/
│   │   │   │       ├── UserList.tsx              # エントリ（Suspense境界）
│   │   │   │       ├── UserList.container.tsx    # データ取得・更新
│   │   │   │       ├── UserList.presentation.tsx # 純粋なUI
│   │   │   │       └── hooks.ts
│   │   │   ├── lib/            # ユーティリティ
│   │   │   │   ├── api.ts      # Hono RPCクライアント
│   │   │   │   ├── env.ts      # 環境変数
│   │   │   │   └── params.ts   # useTypedParams, useTypedSearch
│   │   │   └── components/     # 共通コンポーネント
│   │   └── test/
│   └── api/                    # バックエンド（Hono）
│       ├── src/
│       │   ├── index.ts
│       │   ├── routes/
│       │   ├── repo/           # リポジトリ層
│       │   │   ├── interface.ts
│       │   │   ├── d1.ts
│       │   │   └── memory.ts   # テスト用
│       │   └── lib/
│       │       ├── env.ts
│       │       └── response.ts # okResponse, errorResponse
│       └── test/
├── packages/
│   └── shared/                 # 共通コード
│       ├── result.ts           # Result型
│       ├── error.ts            # AppError
│       └── schema/             # 共通zodスキーマ
├── bunfig.toml
└── biome.json
```
