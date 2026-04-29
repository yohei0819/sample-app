// 追加 (#107): タイムセールバリデータ
import { z } from 'zod'

// API 入力用（JSON で日時が文字列として届くので coerce する）
export const saleApiSchema = z
  .object({
    productId: z.string().min(1, '商品を選択してください'),
    salePrice: z
      .number()
      .int('セール価格は整数で入力してください')
      .min(0, 'セール価格は0以上で入力してください'),
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
    isActive: z.boolean().default(true),
  })
  .refine((v) => v.endsAt > v.startsAt, {
    message: '終了日時は開始日時より後である必要があります',
    path: ['endsAt'],
  })

// フォーム用（既に Date オブジェクトとしてバインド済みの想定）
export const saleSchema = z
  .object({
    productId: z.string().min(1, '商品を選択してください'),
    salePrice: z
      .number()
      .int('セール価格は整数で入力してください')
      .min(0, 'セール価格は0以上で入力してください'),
    startsAt: z.date({ message: '開始日時を入力してください' }),
    endsAt: z.date({ message: '終了日時を入力してください' }),
    isActive: z.boolean(),
  })
  .refine((v) => v.endsAt > v.startsAt, {
    message: '終了日時は開始日時より後である必要があります',
    path: ['endsAt'],
  })

export type SaleFormValues = z.infer<typeof saleSchema>
