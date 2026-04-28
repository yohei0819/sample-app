// バックインストック通知のZodバリデーションスキーマ
import { z } from 'zod'
import { EMAIL_MAX_LENGTH } from '@/constants/notifications'

// 購読登録リクエストのスキーマ
// TODO: 公開APIのためレート制限の強化（IP+グローバル）は別PRで対応
export const subscribeSchema = z.object({
  email: z
    .email({ message: '有効なメールアドレスを入力してください' })
    .max(EMAIL_MAX_LENGTH, { message: 'メールアドレスが長すぎます' }), // 変更: RFC5321準拠の最大長制限
  productId: z
    .string()
    .min(1, '商品IDは必須です')
    .max(64, { message: '商品IDが長すぎます' }), // 変更: ペイロードサイズ制限
})

export type SubscribeInput = z.infer<typeof subscribeSchema>
