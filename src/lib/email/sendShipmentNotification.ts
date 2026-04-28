import 'server-only'
import { resend } from '@/lib/email/client'
import { EMAIL_FROM, EMAIL_SUBJECTS } from '@/constants/email'
import {
  renderShipmentNotificationHtml,
  type ShipmentNotificationOrder,
} from '@/lib/email/templates/shipmentNotification'

// 戻り値型
type SendResult = { success: boolean; error?: string }

// 発送通知メール送信関数
// 失敗時もthrowせず、注文ステータス変更処理本体に影響を与えない
export const sendShipmentNotificationEmail = async (params: {
  to: string
  order: ShipmentNotificationOrder
}): Promise<SendResult> => {
  const { to, order } = params
  try {
    const html = renderShipmentNotificationHtml(order)
    await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: EMAIL_SUBJECTS.SHIPMENT_NOTIFICATION,
      html,
    })
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : '不明なエラー'
    console.error('[sendShipmentNotificationEmail] 送信失敗:', err)
    return { success: false, error: message }
  }
}
