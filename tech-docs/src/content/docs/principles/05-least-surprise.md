---
title: 驚き最小の法則
description: Principle of Least Astonishment - 予測可能な設計を心がける
---

「驚き最小の法則」（Principle of Least Astonishment / POLA）は、システムの挙動がユーザーの予測と一致するよう設計する原則。

## なぜ重要か

- **認知負荷の軽減**: 予測通りに動けば考える必要がない
- **バグの予防**: 想定外の挙動は誤用を招く
- **オンボーディング**: 新メンバーが直感的に理解できる

## コード例

### 関数名と戻り値

```typescript
// ❌ 驚きあり: 名前と挙動の不一致
function getUser(id: string) {
  // DBに存在しない場合、新規作成して返す
  return db.user.upsert({ where: { id }, create: { id } });
}

// ✅ 驚きなし: 名前通りの挙動
function getUser(id: string) {
  return db.user.findUnique({ where: { id } });
}

function getOrCreateUser(id: string) {
  return db.user.upsert({ where: { id }, create: { id } });
}
```

### 副作用

```typescript
// ❌ 驚きあり: 取得関数に隠れた副作用
function getActiveUsers() {
  const users = db.user.findMany({ where: { active: true } });
  analytics.track('users_fetched', { count: users.length }); // 隠れた副作用
  return users;
}

// ✅ 驚きなし: 副作用は明示的に分離
function getActiveUsers() {
  return db.user.findMany({ where: { active: true } });
}

// 呼び出し側で明示的に
const users = getActiveUsers();
analytics.track('users_fetched', { count: users.length });
```

### 引数の順序

```typescript
// ❌ 驚きあり: 一般的でない順序
function copyFile(destination: string, source: string) { ... }

// ✅ 驚きなし: Unix慣習に従う (cp source dest)
function copyFile(source: string, destination: string) { ... }
```

## UI例

### ボタン配置

```
❌ 驚きあり:
┌─────────────────────────────┐
│  本当に削除しますか？         │
│  [削除] [キャンセル]          │  ← 破壊的操作が左
└─────────────────────────────┘

✅ 驚きなし:
┌─────────────────────────────┐
│  本当に削除しますか？         │
│  [キャンセル] [削除]          │  ← 安全な選択肢が左
└─────────────────────────────┘
```

### 確認ダイアログ

```
❌ 驚きあり: 二重否定
「保存せずに終了しますか？」 [いいえ] [はい]

✅ 驚きなし: 明確な選択肢
「保存しますか？」 [保存せず終了] [保存して終了]
```

## API例

### レスポンス構造の一貫性

```typescript
// ❌ 驚きあり: エンドポイントごとに構造が違う
GET /users/1     → { id: 1, name: "Alice" }
GET /users       → [{ id: 1, name: "Alice" }]
GET /users/count → 42

// ✅ 驚きなし: 一貫した構造
GET /users/1     → { data: { id: 1, name: "Alice" } }
GET /users       → { data: [{ id: 1, name: "Alice" }], meta: { total: 1 } }
GET /users/count → { data: { count: 42 } }
```

### エラーレスポンス

```typescript
// ❌ 驚きあり: エラーごとに形式が違う
{ "error": "Not found" }
{ "message": "Validation failed", "details": [...] }
{ "code": 500 }

// ✅ 驚きなし: 統一されたエラー形式
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力値が不正です",
    "details": [...]
  }
}
```

## 判断基準チェックリスト

設計時に確認すること:

1. **名前は挙動を正確に表しているか**
   - `getX` は取得のみ、`createX` は作成のみ
   - 副作用があるなら名前に含める（`saveAndNotify`）

2. **既存の慣習に従っているか**
   - 言語・フレームワークの標準的なパターン
   - チーム内の既存コードとの一貫性

3. **類似機能と一貫しているか**
   - 同じパターンには同じインターフェース
   - 特別な理由なく例外を作らない

4. **デフォルト値は安全か**
   - 破壊的操作のデフォルトは無効
   - 省略時は最も安全な挙動

5. **暗黙の挙動はないか**
   - 自動変換、自動補完、自動削除
   - あるなら明示的なオプトイン
