import 'server-only'
import { resend } from '@/lib/email/client'
import { env } from '@/env' // 変更: 送信元アドレスを環境変数から取得
import { EMAIL_SUBJECTS } from '@/constants/email'
import {
  renderShipmentNotificationHtml,
  type ShipmentNotificationOrder,
} from '@/lib/email/templates/shipmentNotification'
import { getEmailTemplateOrFallback } from '@/lib/db/emailTemplates' // 追加
import { applyTemplateVariables } from '@/lib/email/templateEngine' // 追加
import { escapeHtml } from '@/lib/email/utils' // 追加
import { EmailTemplateKey } from '@/generated/prisma/enums' // 追加

// 戻り値型
type SendResult = { success: boolean; error?: string }

// 発送通知メール送信関数
// 失敗時もthrowせず、注文ステータス変更処理本体に影響を与えない
// 追加: trackingNumber は任意（未指定時は空文字で置換）
export const sendShipmentNotificationEmail = async (params: {
  to: string
  order: ShipmentNotificationOrder
  trackingNumber?: string
}): Promise<SendResult> => {
  const { to, order, trackingNumber } = params
  try {
    // 追加: DBにカスタムテンプレートがあれば優先使用、無ければ従来のレンダラー
    const fallbackHtml = renderShipmentNotificationHtml(order)
    const tpl = await getEmailTemplateOrFallback(EmailTemplateKey.SHIPMENT_NOTIFICATION, {
      subject: EMAIL_SUBJECTS.SHIPMENT_NOTIFICATION,
      bodyHtml: fallbackHtml,
    })

    let subject = tpl.subject
    let html = tpl.bodyHtml

    if (tpl.isCustom) {
      const vars = {
        orderNumber: escapeHtml(order.id),
        customerName: escapeHtml(order.shippingAddress.name),
        trackingNumber: trackingNumber ? escapeHtml(trackingNumber) : '',
      }
      subject = applyTemplateVariables(tpl.subject, vars)
      html = applyTemplateVariables(tpl.bodyHtml, vars)
    }

    await resend.emails.send({
      from: env.EMAIL_FROM, // 変更: ハードコード解消
      to,
      subject,
      html,
    })
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : '不明なエラー'
    console.error('[sendShipmentNotificationEmail] 送信失敗:', err)
    return { success: false, error: message }
  }
}
