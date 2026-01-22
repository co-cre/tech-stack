---
title: 品質・運用
description: Lint、Format、テスト、エラーハンドリング、CI/CD
---

| 項目 | 選定 | 備考 |
|------|------|------|
| Lint/Format | Biome | ESLint + Prettier の代替 |
| テスト | Bun test | IFに対してテスト |
| エラーハンドリング | Result型（自前） | ok/err パターン |
| CI/CD | GitHub Actions | → Cloudflare Pages / Cloud Build |

## Biome

Rust製の高速Linter/Formatter。

**選定理由**
- ESLint + Prettierより高速
- 設定がシンプル
- 単一ツールで完結

**検討した代替案**

| 技術 | 不採用理由 |
|------|-----------|
| ESLint + Prettier | 設定が複雑、遅い |
| dprint | Lintがない |

## Bun test

Bun内蔵のテストランナー。

**選定理由**
- Jest互換API
- 高速
- 追加インストール不要

**テスト方針**
- 実装詳細ではなくインターフェースに対してテスト
- モックは外部依存（DB、API）のみ
- リポジトリ層はメモリ実装でテスト

## Result型

例外を使わないエラーハンドリング。

**選定理由**
- 型でエラーを表現
- 呼び出し側でハンドリング強制
- try-catchの地獄を回避

詳細は[実装パターン: Result型](/patterns/01-result/)を参照。
