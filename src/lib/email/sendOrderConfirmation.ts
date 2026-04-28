import 'server-only'
import { resend } from '@/lib/email/client'
import { env } from '@/env' // 変更: 送信元アドレスを環境変数から取得
import { EMAIL_SUBJECTS } from '@/constants/email'
import {
  renderOrderConfirmationHtml,
  renderOrderConfirmationItemsHtml, // 追加
  formatOrderJpy, // 追加
  type OrderConfirmationItem,
  type OrderConfirmationOrder,
} from '@/lib/email/templates/orderConfirmation'
import { getEmailTemplateOrFallback } from '@/lib/db/emailTemplates' // 追加
import { applyTemplateVariables } from '@/lib/email/templateEngine' // 追加
import { escapeHtml } from '@/lib/email/utils' // 追加
import { EmailTemplateKey } from '@/generated/prisma/enums' // 追加

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
    // 追加: DBにカスタムテンプレートがあれば優先使用、無ければ従来のレンダラー
    const fallbackHtml = renderOrderConfirmationHtml(order, items)
    const tpl = await getEmailTemplateOrFallback(EmailTemplateKey.ORDER_CONFIRMATION, {
      subject: EMAIL_SUBJECTS.ORDER_CONFIRMATION,
      bodyHtml: fallbackHtml,
    })

    let subject = tpl.subject
    let html = tpl.bodyHtml

    if (tpl.isCustom) {
      // 変更: 件名はプレーンテキストのため生値、本文はHTMLのためエスケープ値を埋め込む
      const totalAmount = formatOrderJpy(order.totalPrice)
      // 件名用（生値）
      const rawVars = {
        orderNumber: order.id,
        customerName: order.shippingAddress.name,
        totalAmount,
        // 件名にitemsHtmlを埋め込むことは想定しないが、誤って含めても安全な空文字を渡す
        itemsHtml: '',
      }
      // 本文用（顧客入力値はescapeHtmlで安全化、itemsHtmlは内部生成済みHTML）
      const htmlVars = {
        orderNumber: escapeHtml(order.id),
        customerName: escapeHtml(order.shippingAddress.name),
        totalAmount,
        itemsHtml: renderOrderConfirmationItemsHtml(items),
      }
      subject = applyTemplateVariables(tpl.subject, rawVars)
      html = applyTemplateVariables(tpl.bodyHtml, htmlVars)
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
    console.error('[sendOrderConfirmationEmail] 送信失敗:', err)
    return { success: false, error: message }
  }
}
