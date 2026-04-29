// 配送先アドレス帳の Zod バリデーションスキーマ（#134）
import { z } from 'zod'

// 入力スキーマ（POST/PATCH 共通の本体）
export const addressInputSchema = z.object({
  name: z
    .string()
    .min(1, 'お名前を入力してください')
    .max(100, 'お名前は100文字以内で入力してください'),
  postalCode: z
    .string()
    .min(1, '郵便番号を入力してください')
    .max(10, '郵便番号の形式が正しくありません')
    .regex(/^[0-9-]+$/, '郵便番号は数字とハイフンで入力してください'),
  prefecture: z
    .string()
    .min(1, '都道府県を入力してください')
    .max(20, '都道府県は20文字以内で入力してください'),
  city: z
    .string()
    .min(1, '市区町村を入力してください')
    .max(100, '市区町村は100文字以内で入力してください'),
  addressLine1: z
    .string()
    .min(1, '番地を入力してください')
    .max(200, '住所1は200文字以内で入力してください'),
  addressLine2: z
    .union([
      z.literal('').transform(() => undefined),
      z.string().max(200, '住所2は200文字以内で入力してください'),
    ])
    .optional(),
  phone: z
    .string()
    .min(1, '電話番号を入力してください')
    .max(20, '電話番号の形式が正しくありません')
    .regex(/^[0-9-+() ]+$/, '電話番号の形式が正しくありません'),
  isDefault: z.boolean().optional(),
})

export type AddressInput = z.infer<typeof addressInputSchema>
