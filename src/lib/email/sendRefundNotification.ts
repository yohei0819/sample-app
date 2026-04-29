import 'server-only'
import { resend } from '@/lib/email/client'
import { env } from '@/env'
import { EMAIL_SUBJECTS } from '@/constants/email'
import {
  renderRefundNotificationHtml,
  type RefundNotificationOrder,
} from '@/lib/email/templates/refundNotification'

type SendResult = { success: boolean; error?: string }

// 返金完了メール送信（#117）
// 失敗時も throw せず、返金処理本体に影響を与えない
export const sendRefundNotificationEmail = async (params: {
  to: string
  order: RefundNotificationOrder
}): Promise<SendResult> => {
  const { to, order } = params
  try {
    const html = renderRefundNotificationHtml(order)
    await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject: EMAIL_SUBJECTS.REFUND_NOTIFICATION,
      html,
    })
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : '不明なエラー'
    console.error('[sendRefundNotificationEmail] 送信失敗:', err)
    return { success: false, error: message }
  }
}
