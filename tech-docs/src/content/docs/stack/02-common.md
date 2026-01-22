---
title: 共通
description: ランタイム、言語、ツールチェーン
---

## 一覧

| 技術 | 用途 | 選定理由 |
|------|------|----------|
| Bun | JS実行、パッケージ管理 | [→ 詳細](/tech-stack/decisions/01-bun) |
| TypeScript | 型安全な開発 | 業界標準 |
| zod | スキーマ定義・バリデーション | 型推論との相性 |
| Biome | Lint / Format | ESLint + Prettier より高速 |

## Bun

高速なJavaScriptランタイム。Node.js互換でありながら、パッケージ管理・テストランナーも内蔵。

```bash
bun install    # パッケージインストール
bun run dev    # スクリプト実行
bun test       # テスト実行
```

## TypeScript

全コードをTypeScriptで記述。`strict: true` で厳密な型チェック。

## zod

ランタイムバリデーション + 型生成を1つのスキーマ定義で実現。

```typescript
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  email: z.string().email(),
});

type User = z.infer<typeof UserSchema>; // 型が自動生成
```

**使用箇所**:
- APIリクエスト/レスポンスのバリデーション
- 環境変数のパース
- フォーム入力の検証

## Biome

Rust製の高速Linter/Formatter。ESLint + Prettier を1ツールで代替。

```bash
bunx biome check .       # lint + format チェック
bunx biome check --write # 自動修正
```
