---
title: "ADR: Bun採用"
description: ランタイム・パッケージマネージャとしてBunを採用
---

## ステータス

採用済み

## コンテキスト

JavaScript/TypeScriptのランタイムとパッケージマネージャを選定する必要があった。

## 決定

**Bun**を採用する。

## 理由

- pnpmより高速なパッケージインストール
- ネイティブTypeScriptサポート（トランスパイル不要）
- 内蔵テストランナー（Jest互換API）
- バンドラ内蔵
- Node.js互換

## 検討した代替案

| 技術 | 不採用理由 |
|------|-----------|
| Node.js + pnpm | Bunより遅い |
| Node.js + npm | さらに遅い |
| Deno | Node.js互換性が限定的 |

## 影響

- `bun install`, `bun run`, `bun test`を使用
- TypeScriptの実行に追加設定不要
- 一部Node.js APIで互換性問題の可能性あり（現時点で問題なし）
