import 'server-only'
import { resend } from '@/lib/email/client'
import { env } from '@/env'
import { EMAIL_SUBJECTS } from '@/constants/email'
import {
  renderBackInStockNotificationHtml,
  type BackInStockProduct,
} from '@/lib/email/templates/backInStockNotification'

// 戻り値型
type SendResult = { success: boolean; error?: string }

// バックインストック通知メール送信関数
// 失敗時もthrowせず、呼び出し元のループ処理を中断しない
export const sendBackInStockNotificationEmail = async (params: {
  to: string
  product: BackInStockProduct
}): Promise<SendResult> => {
  const { to, product } = params
  try {
    const html = renderBackInStockNotificationHtml(product, env.NEXT_PUBLIC_APP_URL)
    await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject: EMAIL_SUBJECTS.BACK_IN_STOCK,
      html,
    })
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : '不明なエラー'
    console.error('[sendBackInStockNotificationEmail] 送信失敗:', err)
    return { success: false, error: message }
  }
}
