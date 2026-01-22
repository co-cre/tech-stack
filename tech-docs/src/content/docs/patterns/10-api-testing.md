---
title: APIテスト
description: Hono APIのテストパターン
---

## 方針

- **app.request()** でHTTPレベルのテスト
- **リポジトリ層をDI** でDBをインメモリ実装に差し替え
- **レスポンス形式を検証** (ステータスコード、JSON構造)

## 基本パターン

```typescript
// apps/api/test/users.test.ts
import { describe, test, expect, beforeEach } from 'bun:test';
import { createApp } from '../src/app';
import { InMemoryUserRepo } from '../src/repo/memory';

describe('GET /users/:id', () => {
  let repo: InMemoryUserRepo;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    repo = new InMemoryUserRepo();
    app = createApp({ userRepo: repo });
  });

  test('存在するユーザーを返す', async () => {
    // Arrange
    const user = await repo.create({ name: 'Alice', email: 'alice@example.com' });

    // Act
    const res = await app.request(`/users/${user.id}`);
    const json = await res.json();

    // Assert
    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.value.name).toBe('Alice');
  });

  test('存在しないユーザーは404', async () => {
    const res = await app.request('/users/not-found');
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.ok).toBe(false);
    expect(json.error.code).toBe('NOT_FOUND');
  });
});
```

## POSTリクエストのテスト

```typescript
describe('POST /users', () => {
  test('ユーザーを作成', async () => {
    const res = await app.request('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Bob', email: 'bob@example.com' }),
    });
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.ok).toBe(true);
    expect(json.value.name).toBe('Bob');
  });

  test('バリデーションエラー', async () => {
    const res = await app.request('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '' }), // 空文字
    });

    expect(res.status).toBe(400);
  });
});
```

## 認証が必要なエンドポイント

```typescript
describe('DELETE /users/:id', () => {
  test('認証なしは401', async () => {
    const res = await app.request('/users/1', { method: 'DELETE' });

    expect(res.status).toBe(401);
  });

  test('認証ありで削除成功', async () => {
    const user = await repo.create({ name: 'Alice', email: 'alice@example.com' });

    const res = await app.request(`/users/${user.id}`, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer valid-token' },
    });

    expect(res.status).toBe(200);
  });
});
```

## 認可テスト

認可は**必ずテストする**。漏れがあるとセキュリティ事故に直結する。

### ロールのテスト

```typescript
describe('DELETE /users/:id', () => {
  test('adminロールは削除できる', async () => {
    const user = await repo.create({ name: 'Alice', email: 'alice@example.com' });

    const res = await app.request(`/users/${user.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    expect(res.status).toBe(200);
  });

  test('userロールは削除できない', async () => {
    const user = await repo.create({ name: 'Alice', email: 'alice@example.com' });

    const res = await app.request(`/users/${user.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userToken}` },
    });

    expect(res.status).toBe(403);
    expect((await res.json()).error.code).toBe('FORBIDDEN');
  });
});
```

### リソース所有権のテスト

他人のリソースにアクセスできないことを検証する。

```typescript
describe('GET /posts/:id', () => {
  test('自分の投稿は取得できる', async () => {
    const post = await postRepo.create({
      title: 'My Post',
      authorId: currentUser.id
    });

    const res = await app.request(`/posts/${post.id}`, {
      headers: { Authorization: `Bearer ${currentUserToken}` },
    });

    expect(res.status).toBe(200);
  });

  test('他人の非公開投稿は取得できない', async () => {
    const otherUser = await userRepo.create({ name: 'Other', email: 'other@example.com' });
    const post = await postRepo.create({
      title: 'Private',
      authorId: otherUser.id,
      isPublic: false,
    });

    const res = await app.request(`/posts/${post.id}`, {
      headers: { Authorization: `Bearer ${currentUserToken}` },
    });

    expect(res.status).toBe(404); // 存在を隠す
  });
});

describe('PATCH /posts/:id', () => {
  test('他人の投稿は編集できない', async () => {
    const otherUser = await userRepo.create({ name: 'Other', email: 'other@example.com' });
    const post = await postRepo.create({
      title: 'Other Post',
      authorId: otherUser.id
    });

    const res = await app.request(`/posts/${post.id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${currentUserToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: 'Hacked!' }),
    });

    expect(res.status).toBe(403);
  });
});
```

### テスト用ヘルパー

```typescript
// test/helpers.ts
export function createTestToken(user: { id: string; role: string }): string {
  // テスト用の簡易トークン生成
  return Buffer.from(JSON.stringify(user)).toString('base64');
}

// beforeEach
const adminToken = createTestToken({ id: 'admin-1', role: 'admin' });
const userToken = createTestToken({ id: 'user-1', role: 'user' });
```

## インメモリリポジトリ

```typescript
// apps/api/src/repo/memory.ts
import type { UserRepo, User, CreateUserInput } from './interface';

export class InMemoryUserRepo implements UserRepo {
  private users: Map<string, User> = new Map();

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null;
  }

  async create(input: CreateUserInput): Promise<User> {
    const user = { id: crypto.randomUUID(), ...input };
    this.users.set(user.id, user);
    return user;
  }

  async delete(id: string): Promise<void> {
    this.users.delete(id);
  }

  // テスト用: 初期データ設定
  seed(users: User[]): void {
    users.forEach((u) => this.users.set(u.id, u));
  }
}
```

## テスト実行

```bash
bun test apps/api          # APIテストのみ
bun test users.test.ts     # 特定ファイル
bun test --watch           # ウォッチモード
```

## 関連

- [リポジトリ層](/tech-stack/patterns/03-repository)
- [レスポンス](/tech-stack/patterns/02-api-response)
- [テストの考え方](/tech-stack/principles/03-testing-philosophy)
