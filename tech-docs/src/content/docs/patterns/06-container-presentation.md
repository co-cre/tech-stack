---
title: Container / Presentation
description: データ取得とUI描画の分離
---

コンポーネントを3層に分離:
1. **Entry** - Suspense境界
2. **Container** - データ取得・更新
3. **Presentation** - 純粋なUI

## 読み取りのみ

### Presentation（純粋UI）

```tsx
// UserList.presentation.tsx

type Props = {
  users: User[]
}

export const UserListPresentation = ({ users }: Props) => (
  <ul>
    {users.map(u => (
      <li key={u.id}>{u.name}</li>
    ))}
  </ul>
)
```

### Container（データ取得）

```tsx
// UserList.container.tsx

export const UserListContainer = () => {
  const { data: result } = useSuspenseQuery({
    queryKey: ['users'],
    queryFn: () => fetchUsers(),
  })

  if (!result.ok) {
    return <ErrorView error={result.error} />
  }

  return <UserListPresentation users={result.value} />
}
```

### Entry（Suspense境界）

```tsx
// UserList.tsx

export const UserList = () => (
  <ErrorBoundary fallback={<Error />}>
    <Suspense fallback={<Loading />}>
      <UserListContainer />
    </Suspense>
  </ErrorBoundary>
)
```

## 更新あり

### Presentation

```tsx
// UserList.presentation.tsx

type Props = {
  users: User[]
  onDelete: (id: string) => void
  isDeleting: boolean
}

export const UserListPresentation = ({ users, onDelete, isDeleting }: Props) => (
  <ul>
    {users.map(u => (
      <li key={u.id}>
        {u.name}
        <button onClick={() => onDelete(u.id)} disabled={isDeleting}>
          削除
        </button>
      </li>
    ))}
  </ul>
)
```

### Container

```tsx
// UserList.container.tsx

export const UserListContainer = () => {
  const queryClient = useQueryClient()

  const { data: result } = useSuspenseQuery({
    queryKey: ['users'],
    queryFn: () => fetchUsers(),
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (id: string) =>
      client.users[':id'].$delete({ param: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  if (!result.ok) {
    return <ErrorView error={result.error} />
  }

  return (
    <UserListPresentation
      users={result.value}
      onDelete={mutate}
      isDeleting={isPending}
    />
  )
}
```

## ファイル構成

```
features/
└── users/
    ├── UserList.tsx              # エントリポイント
    ├── UserList.container.tsx    # データ取得・更新
    ├── UserList.presentation.tsx # 純粋なUI
    └── hooks.ts                  # 機能固有フック
```

## メリット

- **Presentationはテスト容易**: propsを渡すだけ
- **責務が明確**: データとUIが分離
- **Suspense統合**: 非同期処理が宣言的
