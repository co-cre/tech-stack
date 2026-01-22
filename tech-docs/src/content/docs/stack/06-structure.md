---
title: ディレクトリ構成
description: モノレポのディレクトリ構造
---

```
monorepo/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── features/        # 機能単位
│   │   │   │   └── users/
│   │   │   │       ├── UserList.tsx              # エントリ（Suspense境界）
│   │   │   │       ├── UserList.container.tsx    # データ取得・更新
│   │   │   │       ├── UserList.presentation.tsx # 純粋なUI
│   │   │   │       └── hooks.ts
│   │   │   ├── lib/             # ユーティリティ
│   │   │   │   ├── api.ts       # Hono RPCクライアント
│   │   │   │   ├── env.ts       # 環境変数
│   │   │   │   └── params.ts    # useTypedParams, useTypedSearch
│   │   │   └── components/      # 共通コンポーネント
│   │   └── test/
│   └── api/
│       ├── src/
│       │   ├── index.ts
│       │   ├── routes/
│       │   ├── repo/            # リポジトリ層（IF定義）
│       │   │   ├── interface.ts
│       │   │   ├── d1.ts
│       │   │   └── memory.ts    # テスト用
│       │   └── lib/
│       │       ├── env.ts
│       │       └── response.ts  # okResponse, errorResponse
│       └── test/
├── packages/
│   └── shared/
│       ├── result.ts            # Result型
│       ├── error.ts             # AppError
│       └── schema/              # 共通zodスキーマ
├── bunfig.toml
└── biome.json
```

## apps/

アプリケーション本体。

- `web/` - フロントエンド（Vite + React）
- `api/` - バックエンド（Hono）

## apps/web/src/

### features/

機能単位でコンポーネントをまとめる。

```
features/
└── users/
    ├── UserList.tsx              # エントリポイント
    ├── UserList.container.tsx    # データ取得
    ├── UserList.presentation.tsx # UI
    └── hooks.ts                  # 機能固有フック
```

### lib/

アプリ全体で使うユーティリティ。

- `api.ts` - Hono RPCクライアント
- `env.ts` - 環境変数
- `params.ts` - 型付きURLパラメータ

### components/

共通UIコンポーネント（Button, Modal等）。

## apps/api/src/

### repo/

リポジトリ層。インターフェースと実装を分離。

- `interface.ts` - インターフェース定義
- `d1.ts` - D1実装
- `memory.ts` - テスト用インメモリ実装

### lib/

- `response.ts` - okResponse, errorResponse

## packages/shared/

アプリ間で共有するコード。

- `result.ts` - Result型
- `error.ts` - AppError型
- `schema/` - 共通zodスキーマ
