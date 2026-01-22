---
title: セキュリティチェックリスト
description: デプロイ前の確認事項
---

リリース前に確認すべきセキュリティ項目。

## 認証・認可

- [ ] 認証が必要なエンドポイントにミドルウェアが適用されている
- [ ] 認可チェックが適切に実装されている
- [ ] パスワードはハッシュ化して保存（bcrypt、Argon2）
- [ ] セッション/トークンに適切な有効期限が設定されている
- [ ] ログアウト時にトークン/セッションが無効化される

## 入力検証

- [ ] すべてのAPIエンドポイントでZodバリデーション
- [ ] ファイルアップロードのサイズ・種類制限
- [ ] SQLはDrizzle経由（生SQL禁止）
- [ ] ユーザー入力をURLに使う場合はプロトコル検証

## シークレット管理

- [ ] `.env` が `.gitignore` に含まれている
- [ ] 本番シークレットはCloudflare Secrets
- [ ] コードにハードコードされたシークレットがない
- [ ] ログにシークレットが出力されていない
- [ ] エラーメッセージにシークレットが含まれていない

## HTTP ヘッダー

- [ ] CORS設定が適切（本番オリジンのみ許可）
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: DENY`
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] CSPが設定されている（可能な範囲で）

## データ保護

- [ ] 機密データ（PII）のログ出力禁止
- [ ] 不要なデータはレスポンスに含めない
- [ ] 削除APIは論理削除 or 適切な権限チェック
- [ ] 一覧APIにページング制限がある

## エラーハンドリング

- [ ] 500エラー時に内部情報を露出しない
- [ ] スタックトレースを本番で返さない
- [ ] エラーメッセージが攻撃のヒントにならない

## レート制限

- [ ] 認証エンドポイントにレート制限
- [ ] 高負荷APIにレート制限
- [ ] Cloudflare WAFルールの設定

```ts
// apps/api/src/middleware/rateLimit.ts

import { rateLimiter } from 'hono-rate-limiter'

export const authRateLimit = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15分
  limit: 5, // 5回まで
  keyGenerator: (c) => c.req.header('CF-Connecting-IP') ?? 'unknown',
})

// 使用例
app.post('/auth/login', authRateLimit, loginHandler)
```

## 依存関係

- [ ] `bun audit` で脆弱性チェック
- [ ] 使用していない依存関係の削除
- [ ] 重要なライブラリは最新に近いバージョン

```bash
# 脆弱性チェック
bun audit

# 更新可能なパッケージ確認
bun outdated
```

## インフラ

- [ ] HTTPSのみ（Cloudflareで自動）
- [ ] 本番DBへの直接アクセス制限
- [ ] Cloudflare Access（管理画面）
- [ ] ログの保持期間設定

## レビュー時の確認ポイント

PRレビュー時に特に注意：

1. **新しいエンドポイント** → 認証・認可は適切か
2. **ユーザー入力の使用** → バリデーションされているか
3. **外部API呼び出し** → シークレットの扱いは適切か
4. **ログ出力** → 機密情報が含まれていないか
5. **エラーハンドリング** → 情報漏洩しないか

## 定期確認

- [ ] 月次: 依存関係の脆弱性チェック
- [ ] 四半期: アクセス権限の棚卸し
- [ ] 年次: セキュリティ設定の見直し

## 関連

- [シークレット管理](/security/01-secrets)
- [CORS/CSP](/security/02-cors-csp)
- [入力検証](/security/03-input-validation)
