// 追加: メールテンプレートの雛形（DB未登録時のフォールバック）
// 管理画面（一覧・編集）と送信側で同一の雛形を参照できるよう集約する
import { EMAIL_SUBJECTS, type EmailTemplateKeyValue } from '@/constants/email'

// テンプレート雛形（件名 + 本文HTML）
export const EMAIL_FALLBACK_TEMPLATES: Record<
  EmailTemplateKeyValue,
  { subject: string; bodyHtml: string }
> = {
  ORDER_CONFIRMATION: {
    subject: EMAIL_SUBJECTS.ORDER_CONFIRMATION,
    bodyHtml: `<p>{{customerName}} 様</p>
<p>この度はご注文いただきありがとうございます。以下の内容で承りました。</p>
<p><strong>注文番号:</strong> {{orderNumber}}<br/>
<strong>合計金額:</strong> {{totalAmount}}</p>
<h2>ご注文内容</h2>
{{itemsHtml}}
<p>商品の発送までしばらくお待ちください。</p>`,
  },
  SHIPMENT_NOTIFICATION: {
    subject: EMAIL_SUBJECTS.SHIPMENT_NOTIFICATION,
    bodyHtml: `<p>{{customerName}} 様</p>
<p>ご注文の商品を発送しました。</p>
<p><strong>注文番号:</strong> {{orderNumber}}<br/>
<strong>追跡番号:</strong> {{trackingNumber}}</p>
<p>到着まで今しばらくお待ちください。</p>`,
  },
  BACK_IN_STOCK: {
    subject: EMAIL_SUBJECTS.BACK_IN_STOCK,
    bodyHtml: `<p>お待たせしました。ご希望の商品が再入荷しました。</p>
<p><strong>{{productName}}</strong></p>
<p><a href="{{productUrl}}">商品ページを見る</a></p>
<p>在庫には限りがありますのでお早めにご検討ください。</p>`,
  },
}

// 件名のみが必要な箇所向けの便宜マップ
export const EMAIL_FALLBACK_SUBJECTS: Record<EmailTemplateKeyValue, string> = {
  ORDER_CONFIRMATION: EMAIL_FALLBACK_TEMPLATES.ORDER_CONFIRMATION.subject,
  SHIPMENT_NOTIFICATION: EMAIL_FALLBACK_TEMPLATES.SHIPMENT_NOTIFICATION.subject,
  BACK_IN_STOCK: EMAIL_FALLBACK_TEMPLATES.BACK_IN_STOCK.subject,
}
