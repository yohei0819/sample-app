// メール通知テンプレートのバリデーションスキーマ
import { z } from 'zod'
import { EMAIL_TEMPLATE_KEYS } from '@/constants/email'

// テンプレートキー
export const emailTemplateKeySchema = z.enum([
  EMAIL_TEMPLATE_KEYS.ORDER_CONFIRMATION,
  EMAIL_TEMPLATE_KEYS.SHIPMENT_NOTIFICATION,
  EMAIL_TEMPLATE_KEYS.BACK_IN_STOCK,
])

// テンプレート編集（subject / bodyHtml の更新）
export const emailTemplateUpsertSchema = z.object({
  subject: z
    .string()
    .min(1, '件名を入力してください')
    .max(200, '件名は200文字以内で入力してください'),
  bodyHtml: z
    .string()
    .min(1, '本文を入力してください')
    .max(50000, '本文は50000文字以内で入力してください'),
})

export type EmailTemplateUpsertValues = z.infer<typeof emailTemplateUpsertSchema>
