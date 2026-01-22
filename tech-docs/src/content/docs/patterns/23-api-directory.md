---
title: APIディレクトリ構成
description: Honoアプリケーションの推奨ディレクトリ構造
---

## 構造

```
apps/api/
├── src/
│   ├── index.ts            # エントリポイント
│   ├── domain/             # ドメイン層
│   │   ├── user.ts         # Entity
│   │   └── email.ts        # Value Object
│   ├── usecase/            # ユースケース層
│   │   ├── create-user.ts
│   │   └── update-user.ts
│   ├── routes/             # ルート定義（薄く）
│   │   ├── users.ts
│   │   └── posts.ts
│   ├── repo/               # リポジトリ層
│   │   ├── interface.ts    # インターフェース
│   │   ├── d1.ts           # D1実装
│   │   └── memory.ts       # テスト用インメモリ
│   └── lib/                # ユーティリティ
│       ├── env.ts
│       ├── result.ts       # ok/err
│       └── response.ts     # okResponse, errorResponse
└── test/
    ├── domain/             # ドメイン層テスト
    ├── usecase/            # ユースケーステスト
    └── routes/             # E2Eテスト
```

## 各ディレクトリの責務

| ディレクトリ | 責務 | 依存方向 |
|-------------|------|----------|
| `domain/` | ビジネスルール、Entity、Value Object | 依存なし |
| `usecase/` | アプリケーションロジック | domain/ に依存 |
| `repo/` | データ永続化の抽象化 | domain/ に依存 |
| `routes/` | HTTPリクエストの受け取りと変換 | usecase/, repo/ に依存 |
| `lib/` | 共通ユーティリティ | 依存なし |

## 依存関係の原則

```
routes/ → usecase/ → domain/
              ↓
           repo/ → domain/
```

- 内側の層（domain/）は外側の層を知らない
- 外側から内側への一方向依存
- repo/ はインターフェース（interface.ts）と実装（d1.ts, memory.ts）を分離

## 関連パターン

- [ドメイン層](/tech-stack/patterns/17-domain)
- [ユースケース層](/tech-stack/patterns/18-usecase)
- [リポジトリ層](/tech-stack/patterns/03-repository)
