---
title: "ADR: Result型採用"
description: エラーハンドリングにResult型パターンを採用
---

## ステータス

採用済み

## コンテキスト

例外ベースのエラーハンドリングには以下の問題があった:
- 型でエラーを表現できない
- try-catchの連鎖が読みにくい
- エラーハンドリング漏れに気づきにくい

## 決定

**Result型**（ok/errパターン）を自前実装して採用する。

## 理由

- 型でエラーを表現できる
- 呼び出し側でハンドリングが強制される
- try-catchの地獄を回避
- 関数型プログラミングのベストプラクティス

## 検討した代替案

| 技術 | 不採用理由 |
|------|-----------|
| neverthrow | 機能過剰、依存を増やしたくない |
| ts-results | 同上 |
| 例外のみ | 型でエラーを表現できない |

## 実装

```ts
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E }

const ok = <T>(value: T): Result<T, never> => ({ ok: true, value })
const err = <E>(error: E): Result<never, E> => ({ ok: false, error })
```

詳細は[実装パターン: Result型](/tech-stack/patterns/01-result/)を参照。
