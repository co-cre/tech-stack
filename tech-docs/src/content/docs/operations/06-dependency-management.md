---
title: "依存関係管理"
description: Renovateによる依存パッケージの自動更新
---

## 方針

依存パッケージは**Renovate**で自動更新する。

## なぜRenovateか

- 細かい設定が可能（renovate.json）
- PRのグループ化が柔軟（モノレポ対応◎）
- スケジュール設定が細かい（平日のみ、特定時間帯など）
- 自動マージ条件を細かく設定可能
- ダッシュボードIssueで更新状況を一元管理
- GitHub以外（GitLab, Bitbucket）でも使える

## なぜDependabotではないか

| 項目 | Renovate | Dependabot |
|------|----------|------------|
| 設定の柔軟性 | ◎ | △ |
| グループ化 | 柔軟 | 限定的 |
| PR量 | コントロール可能 | 大量発生しがち |
| モノレポ対応 | ◎ | △ |

## 運用

- `renovate.json`をリポジトリルートに配置
- Renovate GitHub Appをインストール
- 週次でダッシュボードIssueを確認
