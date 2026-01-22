---
title: フォーム
description: react-hook-form + zodによるフォーム実装パターン
---

## 基本構成

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('メールアドレスの形式が不正です'),
  password: z.string().min(8, '8文字以上で入力してください'),
})

type FormData = z.infer<typeof schema>

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormData) => {
    // 送信処理
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <p>{errors.email.message}</p>}

      <input type="password" {...register('password')} />
      {errors.password && <p>{errors.password.message}</p>}

      <button type="submit">ログイン</button>
    </form>
  )
}
```

## shadcn/ui との統合

```tsx
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function LoginForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>メールアドレス</FormLabel>
              <Input {...field} />
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">ログイン</Button>
      </form>
    </Form>
  )
}
```

## サーバーエラーの表示

```tsx
const [serverError, setServerError] = useState<string | null>(null)

const onSubmit = async (data: FormData) => {
  const result = await api.login(data)

  if (!result.ok) {
    setServerError(result.error.message)
    return
  }

  // 成功時の処理
}
```

## バリデーションのタイミング

```tsx
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  mode: 'onBlur',      // フォーカス外れた時
  // mode: 'onChange', // 入力ごと（負荷注意）
  // mode: 'onSubmit', // 送信時のみ（デフォルト）
})
```

## スキーマの共有

```ts
// packages/shared/schema/user.ts
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

// フロントエンド・バックエンド両方で使用
```
