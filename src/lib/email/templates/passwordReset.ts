// パスワードリセットメール テンプレート（#129）
import { escapeHtml } from '@/lib/email/utils'

export type PasswordResetParams = {
  customerName: string
  resetUrl: string
}

export const renderPasswordResetHtml = (params: PasswordResetParams): string => {
  const { customerName, resetUrl } = params
  const safeUrl = escapeHtml(resetUrl)
  return `<!DOCTYPE html>
<html lang="ja">
  <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111827;background-color:#f9fafb;margin:0;padding:24px;">
    <div style="max-width:600px;margin:0 auto;background-color:#ffffff;padding:32px;border-radius:8px;">
      <h1 style="font-size:20px;margin:0 0 16px;">パスワードリセットのご案内</h1>
      <p style="margin:0 0 16px;">${escapeHtml(customerName)} 様</p>
      <p style="margin:0 0 16px;">パスワードリセットのリクエストを受け付けました。下記のボタンから新しいパスワードを設定してください。</p>
      <p style="margin:24px 0;">
        <a href="${safeUrl}" style="display:inline-block;background-color:#111827;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:600;">
          パスワードを再設定する
        </a>
      </p>
      <p style="margin:0 0 8px;font-size:12px;color:#6b7280;">ボタンが押せない場合は、以下の URL をブラウザに貼り付けてください:</p>
      <p style="margin:0 0 24px;font-size:12px;color:#6b7280;word-break:break-all;">${safeUrl}</p>
      <p style="margin:0 0 16px;color:#6b7280;font-size:14px;">※ このリンクは 24 時間有効です。リンクは 1 度のみ使用できます。</p>
      <hr style="margin:32px 0;border:none;border-top:1px solid #e5e7eb;"/>
      <p style="font-size:12px;color:#6b7280;margin:0;">本リクエストに心当たりがない場合は、このメールを破棄してください。アカウントは安全に保たれています。</p>
    </div>
  </body>
</html>`
}
