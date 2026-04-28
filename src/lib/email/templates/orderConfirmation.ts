// 注文確認メールHTMLテンプレート
import type { ShippingAddress } from '@/constants/checkout'
import { escapeHtml } from '@/lib/email/utils' // 変更: 共通ユーティリティに集約

// テンプレートに渡す注文情報の型
export type OrderConfirmationOrder = {
  id: string
  totalPrice: number
  shippingAddress: ShippingAddress
}

// 注文明細の型
export type OrderConfirmationItem = {
  productName: string
  quantity: number
  unitPrice: number
}

// 数値を日本円表記にフォーマット
const formatJpy = (value: number): string => `¥${value.toLocaleString('ja-JP')}`

// 注文確認メールのHTMLを生成する純粋関数
export const renderOrderConfirmationHtml = (
  order: OrderConfirmationOrder,
  items: OrderConfirmationItem[],
): string => {
  const itemsHtml = items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${escapeHtml(item.productName)}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;">${formatJpy(item.unitPrice)}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;">${formatJpy(item.unitPrice * item.quantity)}</td>
        </tr>`,
    )
    .join('')

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
      <h1 style="font-size:20px;margin:0 0 16px;">ご注文ありがとうございます</h1>
      <p style="margin:0 0 16px;">この度はご注文いただき誠にありがとうございます。以下の内容で承りました。</p>
      <p style="margin:0 0 24px;"><strong>注文番号:</strong> ${escapeHtml(order.id)}</p>

      <h2 style="font-size:16px;margin:24px 0 8px;">ご注文内容</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr style="background-color:#f3f4f6;">
            <th style="padding:8px;text-align:left;">商品名</th>
            <th style="padding:8px;text-align:center;">数量</th>
            <th style="padding:8px;text-align:right;">単価</th>
            <th style="padding:8px;text-align:right;">小計</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>

      <p style="text-align:right;margin:16px 0 0;font-size:16px;"><strong>合計金額: ${formatJpy(order.totalPrice)}（税込）</strong></p>

      <h2 style="font-size:16px;margin:24px 0 8px;">配送先</h2>
      <p style="margin:0;line-height:1.6;">${addressHtml}</p>

      <hr style="margin:32px 0;border:none;border-top:1px solid #e5e7eb;"/>
      <p style="font-size:12px;color:#6b7280;margin:0;">本メールは自動送信されています。お問い合わせはサポートまでご連絡ください。</p>
    </div>
  </body>
</html>`
}
