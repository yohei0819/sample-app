// 商品フォームの Zod バリデーションスキーマ
import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().min(1, '商品名を入力してください').max(200, '商品名は200文字以内で入力してください'),
  description: z.string().max(2000, '説明は2000文字以内で入力してください').optional(),
  price: z
    .number()
    .int('価格は整数で入力してください')
    .min(0, '価格は0円以上で入力してください'),
  stock: z
    .number()
    .int('在庫数は整数で入力してください')
    .min(0, '在庫数は0以上で入力してください'),
  categoryId: z.string().optional(),
  isPublished: z.boolean(),
})

export type ProductFormValues = z.infer<typeof productSchema>

// 在庫一括更新スキーマ（管理画面用）
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
