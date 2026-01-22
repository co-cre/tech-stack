---
title: クイックスタート
description: テンプレートを使ったプロジェクト開始方法
---

## テンプレートの使い方

```bash
# リポジトリをクローン
git clone https://github.com/co-cre/tech-stack.git
cd tech-stack/template

# 依存インストール
bun install

# 開発サーバー起動
bun dev
```

## ディレクトリ構成

```
template/
├── apps/
│   ├── web/          # フロントエンド (Vite + React)
│   └── api/          # バックエンド (Hono)
├── packages/
│   └── shared/       # 共通コード
└── package.json
```

## 主要コマンド

| コマンド | 説明 |
|----------|------|
| `bun dev` | 開発サーバー起動 |
| `bun build` | ビルド |
| `bun test` | テスト実行 |
| `bun lint` | Lint実行 |

## 次のステップ

1. [技術スタック一覧](/tech-stack/stack/01-overview/)で採用技術を確認
2. [実装パターン](/tech-stack/patterns/01-result/)でコーディング規約を把握
3. 開発開始
