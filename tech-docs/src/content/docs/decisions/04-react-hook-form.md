---
title: "ADR: React Hook Form採用"
description: フォーム管理にReact Hook Formを採用
---

## ステータス

採用済み

## コンテキスト

Reactアプリケーションのフォーム管理ライブラリを選定する必要があった。

## 決定

**React Hook Form** + zodを採用する。

## 理由

- 非制御コンポーネントベースで高パフォーマンス
- zodとの統合が簡単（@hookform/resolvers）
- shadcn/uiのフォームコンポーネントと相性が良い
- バリデーションエラーの型推論が効く

## 検討した代替案

| 技術 | 不採用理由 |
|------|-----------|
| Formik | 制御コンポーネント、パフォーマンス懸念 |
| 自前useState | バリデーション実装が大変 |
| conform | 将来的な選択肢として保留 |

## 使用例

```tsx
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

const form = useForm({
  resolver: zodResolver(schema),
})
```

## 将来の検討

サーバーアクションやプログレッシブエンハンスメントが必要になったら、conformへの移行を検討。
