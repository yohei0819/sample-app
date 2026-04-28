import 'server-only'
import { resend } from '@/lib/email/client'
import { env } from '@/env'
import { EMAIL_SUBJECTS } from '@/constants/email'
import {
  renderBackInStockNotificationHtml,
  type BackInStockProduct,
} from '@/lib/email/templates/backInStockNotification'
import { getEmailTemplateOrFallback } from '@/lib/db/emailTemplates' // 追加
import { applyTemplateVariables } from '@/lib/email/templateEngine' // 追加
import { escapeHtml } from '@/lib/email/utils' // 追加
import { EmailTemplateKey } from '@/generated/prisma/enums' // 追加

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
    // 追加: DBにカスタムテンプレートがあれば優先使用
    const productUrl = `${env.NEXT_PUBLIC_APP_URL}/products/${encodeURIComponent(product.id)}`
    const fallbackHtml = renderBackInStockNotificationHtml(product, env.NEXT_PUBLIC_APP_URL)
    const tpl = await getEmailTemplateOrFallback(EmailTemplateKey.BACK_IN_STOCK, {
      subject: EMAIL_SUBJECTS.BACK_IN_STOCK,
      bodyHtml: fallbackHtml,
    })

    let subject = tpl.subject
    let html = tpl.bodyHtml

    if (tpl.isCustom) {
      // 変更: 件名は生値、本文はエスケープ値を埋め込む
      const rawVars = {
        productName: product.name,
        productUrl: productUrl,
      }
      const htmlVars = {
        productName: escapeHtml(product.name),
        productUrl: escapeHtml(productUrl),
      }
      subject = applyTemplateVariables(tpl.subject, rawVars)
      html = applyTemplateVariables(tpl.bodyHtml, htmlVars)
    }

    await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    })
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : '不明なエラー'
    console.error('[sendBackInStockNotificationEmail] 送信失敗:', err)
    return { success: false, error: message }
  }
}
