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

// 在庫更新スキーマ
export const inventoryUpdateSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().min(1, '商品IDは必須です'),
      stock: z
        .number()
        .int('在庫数は整数で入力してください')
        .min(0, '在庫数は0以上で入力してください'),
    })
  ),
})

export type InventoryUpdateValues = z.infer<typeof inventoryUpdateSchema>
