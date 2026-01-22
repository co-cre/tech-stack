---
title: Coding Agent
description: AIコーディングツールの選定と運用
---

## ツール

| ツール | 用途 |
|--------|------|
| Claude Code | メイン開発支援 |
| Codex | コード補完・レビュー |

## 方針

### Skills優先

commandsより**Skills**を使う。

- Skills: 標準規格、ポータブル
- commands: ツール固有、移植性低い

### GitHub Actions連携

PRレビューをGitHub Actionsで自動実行。TBD
