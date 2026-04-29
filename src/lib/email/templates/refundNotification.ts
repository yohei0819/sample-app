// 返金完了メールテンプレート（#117）
import { escapeHtml } from '@/lib/email/utils'

export type RefundNotificationOrder = {
  id: string
  customerName: string
  refundedAmount: number
}

export const renderRefundNotificationHtml = (order: RefundNotificationOrder): string => {
  return `<!DOCTYPE html>
<html lang="ja">
  <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111827;background-color:#f9fafb;margin:0;padding:24px;">
    <div style="max-width:600px;margin:0 auto;background-color:#ffffff;padding:32px;border-radius:8px;">
      <h1 style="font-size:20px;margin:0 0 16px;">返金が完了しました</h1>
      <p style="margin:0 0 16px;">${escapeHtml(order.customerName)} 様</p>
      <p style="margin:0 0 16px;">ご返品いただいた注文の返金処理が完了しましたのでお知らせします。</p>
      <p style="margin:0 0 8px;"><strong>注文番号:</strong> ${escapeHtml(order.id)}</p>
      <p style="margin:0 0 24px;"><strong>返金額:</strong> ¥${order.refundedAmount.toLocaleString('ja-JP')}</p>
      <p style="margin:0 0 16px;color:#6b7280;font-size:14px;">※ ご利用のクレジットカード会社の処理により、口座への反映までに数日〜数週間かかる場合があります。</p>
      <hr style="margin:32px 0;border:none;border-top:1px solid #e5e7eb;"/>
      <p style="font-size:12px;color:#6b7280;margin:0;">本メールは自動送信されています。お問い合わせはサポートまでご連絡ください。</p>
    </div>
  </body>
</html>`
}
