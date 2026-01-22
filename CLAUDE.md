# Tech Stack

チームの技術スタック・設計方針・ライブラリ選定のドキュメントリポジトリ。

## ディレクトリ構成

```
tech-stack/
├── tech-docs/          # 技術ドキュメント (Starlight/Astro)
│   └── src/content/docs/
│       ├── frontend/   # フロントエンド技術
│       ├── backend/    # バックエンド技術
│       ├── infrastructure/  # インフラ
│       └── devops/     # DevOps
└── template/           # Webアプリテンプレート
    └── event-ticket/   # イベントチケット販売アプリ MVP
```

## 技術ドキュメント (tech-docs)

Starlight + Astro ベースの静的サイト。GitHub Pagesで公開。

### コマンド

```bash
cd tech-docs
bun install
bun dev       # 開発サーバー
bun build     # ビルド
```

### コンテンツ追加

`tech-docs/src/content/docs/` に `.md` または `.mdx` ファイルを追加。

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
```

### サイドバー構成 (astro.config.mjs)

- 技術スタック: `stack/`
- 実装パターン: `patterns/`
- 選定ガイド: `guides/`

## デプロイ

mainブランチへのpushで自動デプロイ (GitHub Actions)

公開URL: https://co-cre.github.io/tech-stack/
