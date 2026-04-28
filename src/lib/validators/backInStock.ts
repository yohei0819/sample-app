// バックインストック通知のZodバリデーションスキーマ
import { z } from 'zod'

// 購読登録リクエストのスキーマ
export const subscribeSchema = z.object({
  email: z.email({ message: '有効なメールアドレスを入力してください' }),
  productId: z.string().min(1, '商品IDは必須です'),
})

export type SubscribeInput = z.infer<typeof subscribeSchema>
