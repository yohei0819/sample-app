// 注文関連のバリデーションスキーマ
import { z } from 'zod'

// 配送先住所スキーマ
// DBに保存されている shippingAddress (Json) を安全にパースする用途
// 構造は src/constants/checkout.ts の ShippingAddress と一致させる
export const shippingAddressSchema = z.object({
  name: z.string(),
  postalCode: z.string(),
  prefecture: z.string(),
  city: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string().optional(),
  phone: z.string(),
})

export type ShippingAddressParsed = z.infer<typeof shippingAddressSchema>
