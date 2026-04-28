import { z } from 'zod'

// 管理画面でのクーポン作成・編集バリデーション
export const couponSchema = z.object({
  code: z
    .string()
    .min(1, 'クーポンコードを入力してください')
    .max(32, 'クーポンコードは32文字以内で入力してください')
    .regex(/^[A-Z0-9_-]+$/, '大文字英数字・アンダースコア・ハイフンのみ使用できます'),
  discountPct: z
    .number({ message: '割引率を入力してください' })
    .int('割引率は整数で入力してください')
    .min(1, '割引率は1以上で入力してください')
    .max(100, '割引率は100以下で入力してください'),
  maxUses: z
    .number({ message: '利用回数を入力してください' })
    .int('利用回数は整数で入力してください')
    .min(1, '利用回数は1以上で入力してください')
    .nullable()
    .optional(),
  expiresAt: z
    .string()
    .datetime({ message: '有効期限の形式が正しくありません' })
    .nullable()
    .optional(),
  isActive: z.boolean(),
})

export type CouponFormValues = z.infer<typeof couponSchema>

// 購入者がチェックアウト時に入力するクーポンコードのバリデーション
export const couponCodeSchema = z.object({
  code: z.string().min(1, 'クーポンコードを入力してください').max(32),
})

export type CouponCodeValues = z.infer<typeof couponCodeSchema>
