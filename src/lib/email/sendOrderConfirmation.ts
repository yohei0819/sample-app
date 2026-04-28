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
      // カスタムテンプレートに変数を埋め込む（顧客入力値はescapeHtmlで安全化）
      const vars = {
        orderNumber: escapeHtml(order.id),
        customerName: escapeHtml(order.shippingAddress.name),
        totalAmount: formatOrderJpy(order.totalPrice),
        // itemsHtml は内部生成のためエスケープ済みtr群（HTML埋め込みを許容）
        itemsHtml: renderOrderConfirmationItemsHtml(items),
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
    console.error('[sendOrderConfirmationEmail] 送信失敗:', err)
    return { success: false, error: message }
  }
}
