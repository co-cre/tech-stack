---
title: 技術スタック一覧
description: 採用技術のサマリ
---

## 一覧

| カテゴリ | 技術 | 用途 |
|----------|------|------|
| ランタイム | Bun | JS実行、パッケージ管理、テスト |
| API | Hono | Web標準APIフレームワーク |
| ORM | Drizzle | 型安全なDB操作 |
| フロント | Vite + React | ビルド + UI |
| ルーティング | React Router | SPA ルーティング |
| 状態管理 | React Query | サーバー状態管理 |
| フォーム | react-hook-form | フォームバリデーション |
| バリデーション | zod | スキーマ定義・型生成 |
| CSS | Tailwind | ユーティリティファースト |
| UI | shadcn/ui | コンポーネントライブラリ |
| 日付 | date-fns | 日付操作 |
| Lint/Format | Biome | ESLint + Prettier代替 |
| テスト | Bun test | Jest互換テストランナー |

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

## 詳細

各技術の詳細は以下を参照:

- [コア技術](/tech-stack/stack/02-core/) - Bun, Hono, Drizzle
- [型・バリデーション](/tech-stack/stack/03-type-validation/) - zod, Hono RPC
- [フロントエンド](/tech-stack/stack/04-frontend/) - React Router, React Query, shadcn/ui
- [品質・運用](/tech-stack/stack/05-quality/) - Biome, テスト, Result型
- [ディレクトリ構成](/tech-stack/stack/06-structure/) - モノレポ構造
