import 'server-only'
import { resend } from '@/lib/email/client'
import { env } from '@/env' // 変更: 送信元アドレスを環境変数から取得
import { EMAIL_SUBJECTS } from '@/constants/email'
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
      from: env.EMAIL_FROM, // 変更: ハードコード解消
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
