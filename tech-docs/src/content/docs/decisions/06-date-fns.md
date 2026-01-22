---
title: "ADR: date-fns採用"
description: 日付操作ライブラリとしてdate-fnsを採用
---

## ステータス

採用済み

## コンテキスト

JavaScriptの日付操作は標準APIだけでは煩雑なため、ライブラリの導入を検討した。

## 決定

**date-fns**を採用する。

## 理由

- Tree-shaking対応（使った関数だけバンドル）
- 関数型で使いやすい
- 軽量
- TypeScriptサポート良好
- チームで馴染みがある

## 検討した代替案

| 技術 | 不採用理由 |
|------|-----------|
| Day.js | 機能は十分だがチームでの実績がない |
| Moment.js | 非推奨、バンドルサイズが大きい |
| Temporal API | まだ標準化されていない |
| 標準Date API | 操作が煩雑、フォーマットが弱い |

## 使用例

```ts
import { format, addDays, parseISO } from 'date-fns'
import { ja } from 'date-fns/locale'

// フォーマット
format(new Date(), 'yyyy年MM月dd日', { locale: ja })

// 日付計算
addDays(new Date(), 7)

// ISO文字列パース
parseISO('2024-01-01')
```

## 将来の検討

Temporal APIが標準化・普及したら移行を検討。
