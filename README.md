# Tech Stack

技術スタックの選定理由と代替案を共有するドキュメントサイト。

## 開発

```bash
cd tech-docs
bun install
bun dev
```

## デプロイ

mainブランチにpushすると自動でGitHub Pagesにデプロイされる。

https://co-cre.github.io/tech-stack/

## コンテンツの追加

`tech-docs/src/content/docs/` に技術ページを追加:

```markdown
---
title: 技術名
description: 簡単な説明
---

## 選定理由

- 理由1
- 理由2

## 検討した代替案

| 技術 | 不採用理由 |
|------|-----------|
| 代替案A | 理由 |
| 代替案B | 理由 |
```
