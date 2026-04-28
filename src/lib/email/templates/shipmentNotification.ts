// 発送通知メールHTMLテンプレート
import type { ShippingAddress } from '@/constants/checkout'
import { escapeHtml } from '@/lib/email/utils' // 変更: 共通ユーティリティに集約

// テンプレートに渡す注文情報の型
export type ShipmentNotificationOrder = {
  id: string
  shippingAddress: ShippingAddress
}

// 発送通知メールのHTMLを生成する純粋関数
export const renderShipmentNotificationHtml = (order: ShipmentNotificationOrder): string => {
  const addr = order.shippingAddress
  const addressHtml = `
    ${escapeHtml(addr.name)}<br/>
    〒${escapeHtml(addr.postalCode)}<br/>
    ${escapeHtml(addr.prefecture)}${escapeHtml(addr.city)}${escapeHtml(addr.addressLine1)}${addr.addressLine2 ? escapeHtml(addr.addressLine2) : ''}<br/>
    TEL: ${escapeHtml(addr.phone)}
  `

  return `<!DOCTYPE html>
<html lang="ja">
  <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111827;background-color:#f9fafb;margin:0;padding:24px;">
    <div style="max-width:600px;margin:0 auto;background-color:#ffffff;padding:32px;border-radius:8px;">
      <h1 style="font-size:20px;margin:0 0 16px;">商品を発送しました</h1>
      <p style="margin:0 0 16px;">ご注文の商品を発送しましたのでお知らせします。到着まで今しばらくお待ちください。</p>
      <p style="margin:0 0 24px;"><strong>注文番号:</strong> ${escapeHtml(order.id)}</p>

      <h2 style="font-size:16px;margin:24px 0 8px;">配送先</h2>
      <p style="margin:0;line-height:1.6;">${addressHtml}</p>

      <hr style="margin:32px 0;border:none;border-top:1px solid #e5e7eb;"/>
      <p style="font-size:12px;color:#6b7280;margin:0;">本メールは自動送信されています。お問い合わせはサポートまでご連絡ください。</p>
    </div>
  </body>
</html>`
}
