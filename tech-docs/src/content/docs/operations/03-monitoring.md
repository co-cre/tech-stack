---
title: モニタリング
description: Cloudflare Analyticsとカスタムメトリクス
---

サービスの状態を可視化し、問題を早期発見。

## 方針

- Cloudflare標準機能を最大活用
- 必要に応じてカスタムメトリクス追加
- アラートで異常を即座に検知

## ヘルスチェック

### エンドポイント

```ts
// apps/api/src/routes/health.ts

import { Hono } from 'hono'

const app = new Hono()

// シンプルなヘルスチェック
app.get('/health', (c) => {
  return c.json({ status: 'ok' })
})

// 詳細なヘルスチェック
app.get('/health/detailed', async (c) => {
  const checks = {
    api: 'ok',
    database: await checkDatabase(c.env.DB),
    external: await checkExternalApi(),
  }

  const allOk = Object.values(checks).every((v) => v === 'ok')

  return c.json(
    { status: allOk ? 'ok' : 'degraded', checks },
    allOk ? 200 : 503
  )
})

const checkDatabase = async (db: D1Database): Promise<string> => {
  try {
    await db.prepare('SELECT 1').first()
    return 'ok'
  } catch {
    return 'error'
  }
}

const checkExternalApi = async (): Promise<string> => {
  try {
    const res = await fetch('https://api.example.com/health')
    return res.ok ? 'ok' : 'error'
  } catch {
    return 'error'
  }
}
```

### 外部監視

Cloudflare Health Checks または外部サービス（UptimeRobot等）で定期的にヘルスチェックを実行。

## アラート設定

Cloudflare Notifications で設定：

| 条件 | 通知先 |
|------|--------|
| エラー率 > 5% | Slack |
| P95 レイテンシ > 1000ms | Slack |
| ヘルスチェック失敗 | Slack + Email |

## ダッシュボード

### Grafana Cloud（推奨）

Cloudflare Metricsを連携して可視化。

### 簡易ダッシュボード

```ts
// 管理用エンドポイント
app.get('/admin/metrics', authMiddleware, authorize('admin'), async (c) => {
  const [requests, errors] = await Promise.all([
    getRequestCount(c.env.METRICS, '24h'),
    getErrorCount(c.env.METRICS, '24h'),
  ])

  return c.json({
    period: '24h',
    requests,
    errors,
    errorRate: (errors / requests * 100).toFixed(2),
  })
})
```

## 確認すべき項目

### 日次

- エラー率
- レイテンシ推移
- リクエスト数の異常

### 週次

- トレンド分析
- 遅いエンドポイントの特定
- リソース使用量

## 関連

- [ロギング](/operations/01-logging)
- [エラートラッキング](/operations/02-error-tracking)
- [障害対応](/operations/04-incident-response)
