---
title: "ADR: Drizzle採用"
description: ORMとしてDrizzleを採用
---

## ステータス

採用済み

## コンテキスト

型安全なデータベースアクセス層が必要。Cloudflare D1（SQLite）との互換性も要件。

## 決定

**Drizzle ORM**を採用する。

## 理由

- SQLライクな記法で学習コストが低い
- TypeScript型が自動生成される
- D1、Turso、PostgreSQL等マルチDB対応
- バンドルサイズが小さい（エッジ向き）
- マイグレーション管理が組み込み

## 検討した代替案

| 技術 | 不採用理由 |
|------|-----------|
| Prisma | バンドルサイズが大きい、D1対応が不完全 |
| Kysely | 型安全だが機能が少ない |
| TypeORM | デコレータ依存、重い |
| 生SQL | 型安全性がない、手動管理が煩雑 |

### Prisma vs Drizzle 詳細比較

| 観点 | Prisma | Drizzle |
|------|--------|---------|
| バンドルサイズ | 大（〜2MB） | 小（〜50KB） |
| D1サポート | 実験的 | 正式対応 |
| クエリ記法 | 独自DSL | SQLライク |
| 型生成 | codegen必要 | ランタイム推論 |
| マイグレーション | 専用CLI | drizzle-kit |
| 学習コスト | 中〜高 | 低（SQL知識で足りる） |
| エコシステム | 成熟 | 成長中 |

**Prismaを選ばなかった主な理由**:
1. エッジランタイム（Cloudflare Workers）でバンドルサイズがクリティカル
2. D1対応がDrizzleの方が安定
3. SQLに近い記法でデバッグしやすい

## 影響

- スキーマ定義からTypeScript型が自動生成される
- drizzle-kitでマイグレーション管理
- SQLの知識がそのまま活かせる

## 関連

- [マイグレーションパターン](/tech-stack/patterns/09-migration)
