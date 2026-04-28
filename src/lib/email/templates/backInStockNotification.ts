// バックインストック通知メールHTMLテンプレート
import { escapeHtml } from '@/lib/email/utils'

// テンプレートに渡す商品情報の型
export type BackInStockProduct = {
  id: string
  name: string
  images: string[]
}

// バックインストック通知メールのHTMLを生成する純粋関数
// baseUrl は呼び出し側が env.NEXT_PUBLIC_APP_URL を渡す（テスト容易性確保）
export const renderBackInStockNotificationHtml = (
  product: BackInStockProduct,
  baseUrl: string,
): string => {
  const productUrl = `${baseUrl}/products/${encodeURIComponent(product.id)}`
  const thumbnail = product.images[0] ?? null
  const safeName = escapeHtml(product.name)
  const safeUrl = escapeHtml(productUrl)
  const imageHtml = thumbnail
    ? `<img src="${escapeHtml(thumbnail)}" alt="${safeName}" width="240" style="max-width:100%;height:auto;border-radius:8px;display:block;margin:0 0 16px;"/>`
    : ''

  return `<!DOCTYPE html>
<html lang="ja">
  <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111827;background-color:#f9fafb;margin:0;padding:24px;">
    <div style="max-width:600px;margin:0 auto;background-color:#ffffff;padding:32px;border-radius:8px;">
      <h1 style="font-size:20px;margin:0 0 16px;">商品が再入荷しました</h1>
      <p style="margin:0 0 16px;">お待たせいたしました。ご希望の商品が再入荷しましたのでお知らせします。</p>
      ${imageHtml}
      <p style="margin:0 0 16px;font-size:16px;font-weight:600;">${safeName}</p>
      <p style="margin:0 0 24px;">
        <a href="${safeUrl}" style="display:inline-block;background-color:#111827;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;">商品ページを見る</a>
      </p>
      <p style="margin:0 0 8px;font-size:12px;color:#6b7280;">商品URL: <a href="${safeUrl}" style="color:#6b7280;">${safeUrl}</a></p>
      <hr style="margin:32px 0;border:none;border-top:1px solid #e5e7eb;"/>
      <p style="font-size:12px;color:#6b7280;margin:0;">本メールは再入荷通知の購読登録に基づき自動送信されています。在庫には限りがありますのでお早めにご検討ください。</p>
    </div>
  </body>
</html>`
}
