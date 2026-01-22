---
title: テスト
description: テスト関連の技術スタック
---

## 一覧

| 技術 | 用途 |
|------|------|
| Bun test | ユニット・統合テスト |
| Testing Library | コンポーネントテスト |
| msw | APIモック |

## Bun test

Bun内蔵のテストランナー。Jest互換のAPIで移行しやすい。

```typescript
import { describe, expect, test } from 'bun:test';

describe('sum', () => {
  test('adds 1 + 2 to equal 3', () => {
    expect(1 + 2).toBe(3);
  });
});
```

```bash
bun test              # 全テスト実行
bun test --watch      # ウォッチモード
bun test user.test.ts # 特定ファイル
```

## Testing Library

DOM操作なしでコンポーネントをテスト。ユーザー視点のクエリ（getByRole, getByText等）を提供。

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('ボタンクリックでカウントアップ', async () => {
  render(<Counter />);

  await userEvent.click(screen.getByRole('button', { name: '+' }));

  expect(screen.getByText('1')).toBeInTheDocument();
});
```

## msw (Mock Service Worker)

Service Workerを使ったAPIモック。テスト・開発の両方で使用可能。

```typescript
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  http.get('/api/users', () => {
    return HttpResponse.json([{ id: '1', name: 'Alice' }]);
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

**関連**:
- [テストの考え方](/tech-stack/principles/03-testing-philosophy)
- [テストパターン](/tech-stack/patterns/07-testing)
