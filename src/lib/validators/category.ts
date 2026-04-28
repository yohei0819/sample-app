// カテゴリフォームの Zod バリデーションスキーマ
import { z } from 'zod'

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, 'カテゴリ名を入力してください')
    .max(100, 'カテゴリ名は100文字以内で入力してください'),
  slug: z
    .string()
    .min(1, 'スラッグを入力してください')
    .max(100, 'スラッグは100文字以内で入力してください')
    .regex(/^[a-z0-9-]+$/, 'スラッグは半角英数字とハイフンのみ使用できます'),
})

export type CategoryFormValues = z.infer<typeof categorySchema>
