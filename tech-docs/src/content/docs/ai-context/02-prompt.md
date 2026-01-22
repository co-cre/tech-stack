---
title: プロンプト集
description: AIアシスタント向けのコンテキストプロンプト
---

プロジェクトのCLAUDE.mdやCursor Rulesに使えるプロンプト集。

## 基本プロンプト

```markdown
## Tech Stack

- Runtime: Bun
- API: Hono (Web標準)
- Frontend: Vite + React + React Router
- State: React Query (server) + useState (client)
- Form: react-hook-form + zod
- UI: Tailwind + shadcn/ui
- ORM: Drizzle
- Test: Bun test
- Lint: Biome

## Principles

- Simple over Easy
- 必要になったら足す（最初から入れない）
- Web標準に寄せる
- IFに対してテスト（実装詳細をテストしない）
- 外部IOは型で守る（zod validation）
```

## パターン指定プロンプト

```markdown
## Patterns

- Error handling: Result型 (ok/err)
- API response: okResponse/errorResponse
- Component: Container/Presentation分離
- DI: 関数の引数で依存注入（DIコンテナ不要）
- Repository: interface + 実装分離
```

## コード生成時の注意事項

```markdown
## Code Generation Rules

- Use `bun` for package management and running scripts
- Prefer Web standard APIs over library-specific ones
- Always validate external inputs with zod
- Use Result type for error handling, not try-catch
- Keep components pure when possible
- Write tests against public interfaces, not implementation details
```

## Cursor Rules例

```markdown
You are an expert in TypeScript, React, Hono, and Bun.

Key Principles:
- Write concise, type-safe TypeScript code
- Use functional patterns; avoid classes unless necessary
- Prefer iteration and modularization over duplication
- Use descriptive variable names with auxiliary verbs

Error Handling:
- Use Result type pattern instead of try-catch
- Return { ok: true, value } or { ok: false, error }
- Handle errors at the caller side

React:
- Use functional components with TypeScript interfaces
- Use React Query for server state
- Use Suspense for loading states
- Follow Container/Presentation pattern
```

## 使い方

1. プロジェクトの`CLAUDE.md`または`.cursorrules`にコピー
2. プロジェクト固有のルールを追加
3. AIアシスタントがコンテキストとして読み込む
