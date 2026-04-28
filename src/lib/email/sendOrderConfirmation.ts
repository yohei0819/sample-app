import 'server-only'
import { resend } from '@/lib/email/client'
import { env } from '@/env' // 変更: 送信元アドレスを環境変数から取得
import { EMAIL_SUBJECTS } from '@/constants/email'
import {
  renderOrderConfirmationHtml,
  type OrderConfirmationItem,
  type OrderConfirmationOrder,
} from '@/lib/email/templates/orderConfirmation'

// 戻り値型
type SendResult = { success: boolean; error?: string }

// 注文確認メール送信関数
// 失敗時もthrowせず、注文処理本体に影響を与えない
export const sendOrderConfirmationEmail = async (params: {
  to: string
  order: OrderConfirmationOrder
  items: OrderConfirmationItem[]
}): Promise<SendResult> => {
  const { to, order, items } = params
  try {
    const html = renderOrderConfirmationHtml(order, items)
    await resend.emails.send({
      from: env.EMAIL_FROM, // 変更: ハードコード解消
      to,
      subject: EMAIL_SUBJECTS.ORDER_CONFIRMATION,
      html,
    })
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : '不明なエラー'
    console.error('[sendOrderConfirmationEmail] 送信失敗:', err)
    return { success: false, error: message }
  }
}
