---
title: フロントエンドテスト
description: Reactコンポーネントのテストパターン
---

## 方針

- **Presentationコンポーネント** を中心にテスト（props in → UI out）
- **Testing Library** でユーザー視点のクエリ
- **msw** でAPIモック（Container/統合テスト時）

## Presentationコンポーネントテスト

純粋なUIコンポーネントは props を渡すだけでテスト可能。

```typescript
// apps/web/test/UserList.presentation.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserListPresentation } from '../src/features/users/UserList.presentation';

describe('UserListPresentation', () => {
  const defaultProps = {
    users: [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
    ],
    onDelete: vi.fn(),
    isDeleting: false,
  };

  test('ユーザー一覧を表示', () => {
    render(<UserListPresentation {...defaultProps} />);

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  test('削除ボタンクリックでonDelete呼び出し', async () => {
    const onDelete = vi.fn();
    render(<UserListPresentation {...defaultProps} onDelete={onDelete} />);

    await userEvent.click(screen.getAllByRole('button', { name: '削除' })[0]);

    expect(onDelete).toHaveBeenCalledWith('1');
  });

  test('削除中はボタンが無効', () => {
    render(<UserListPresentation {...defaultProps} isDeleting={true} />);

    screen.getAllByRole('button', { name: '削除' }).forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });

  test('ユーザーが0人の場合', () => {
    render(<UserListPresentation {...defaultProps} users={[]} />);

    expect(screen.getByText('ユーザーがいません')).toBeInTheDocument();
  });
});
```

## Container + APIモック

msw でAPIをモックして統合テスト。

```typescript
// apps/web/test/UserList.container.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserListContainer } from '../src/features/users/UserList.container';

const server = setupServer(
  http.get('/api/users', () => {
    return HttpResponse.json({
      ok: true,
      value: [{ id: '1', name: 'Alice' }],
    });
  }),
  http.delete('/api/users/:id', () => {
    return HttpResponse.json({ ok: true });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe('UserListContainer', () => {
  test('APIからユーザー取得して表示', async () => {
    renderWithProviders(<UserListContainer />);

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });
  });

  test('削除後にリストから消える', async () => {
    renderWithProviders(<UserListContainer />);

    await waitFor(() => screen.getByText('Alice'));

    // 削除後のレスポンスを設定
    server.use(
      http.get('/api/users', () => {
        return HttpResponse.json({ ok: true, value: [] });
      })
    );

    await userEvent.click(screen.getByRole('button', { name: '削除' }));

    await waitFor(() => {
      expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    });
  });

  test('APIエラー時にエラー表示', async () => {
    server.use(
      http.get('/api/users', () => {
        return HttpResponse.json({ ok: false, error: { code: 'SERVER_ERROR' } }, { status: 500 });
      })
    );

    renderWithProviders(<UserListContainer />);

    await waitFor(() => {
      expect(screen.getByText(/エラー/)).toBeInTheDocument();
    });
  });
});
```

## フォームテスト

```typescript
// apps/web/test/UserForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserForm } from '../src/features/users/UserForm';

describe('UserForm', () => {
  test('入力して送信', async () => {
    const onSubmit = vi.fn();
    render(<UserForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('名前'), 'Alice');
    await userEvent.type(screen.getByLabelText('メール'), 'alice@example.com');
    await userEvent.click(screen.getByRole('button', { name: '送信' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Alice',
        email: 'alice@example.com',
      });
    });
  });

  test('バリデーションエラー表示', async () => {
    render(<UserForm onSubmit={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: '送信' }));

    expect(await screen.findByText('名前は必須です')).toBeInTheDocument();
  });
});
```

## テスト実行

```bash
bun test apps/web          # フロントテストのみ
bun test --watch           # ウォッチモード
```

## 関連

- [Container / Presentation](/tech-stack/patterns/06-container-presentation)
- [フォーム](/tech-stack/patterns/08-form)
- [テストの考え方](/tech-stack/principles/03-testing-philosophy)
