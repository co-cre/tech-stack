# Tech Stack

チームの技術スタック選定理由と設計方針を共有するリポジトリ。

## 構成

| ディレクトリ | 説明 |
|-------------|------|
| `tech-docs/` | 技術ドキュメントサイト (Starlight/Astro) |
| `template/` | Webアプリテンプレート集 (予定) |

## 技術ドキュメント

### 開発

```bash
cd tech-docs
bun install
bun dev
```

### デプロイ

mainブランチにpushすると自動でGitHub Pagesにデプロイ。

https://co-cre.github.io/tech-stack/

### コンテンツの追加

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

## テンプレート

`template/` にWebアプリケーションの雛形を配置予定。

- SPA
- SSR
- API Server
- etc.
