// 追加 (#131): 商品バリエーションのバリデーションスキーマ
import { z } from 'zod'

// attributes は { [key]: string } のレコード（属性名とその値）
// 例: { "size": "M", "color": "red" }
const attributesSchema = z
  .record(z.string().min(1), z.string().min(1))
  .refine((v) => Object.keys(v).length > 0, {
    message: '属性を 1 つ以上指定してください',
  })

export const productVariantCreateSchema = z.object({
  sku: z
    .string()
    .min(1, 'SKU を入力してください')
    .max(64, 'SKU は 64 文字以内で入力してください'),
  attributes: attributesSchema,
  priceDelta: z
    .number()
    .int('価格差分は整数で入力してください'),
  stock: z
    .number()
    .int('在庫数は整数で入力してください')
    .min(0, '在庫数は 0 以上で入力してください'),
})

export type ProductVariantCreateValues = z.infer<typeof productVariantCreateSchema>

export const productVariantUpdateSchema = productVariantCreateSchema.partial()

export type ProductVariantUpdateValues = z.infer<typeof productVariantUpdateSchema>
