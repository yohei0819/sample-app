import 'server-only'
import { resend } from '@/lib/email/client'
import { env } from '@/env'
import { EMAIL_SUBJECTS } from '@/constants/email'
import {
  renderEmailVerificationHtml,
  type EmailVerificationParams,
} from '@/lib/email/templates/emailVerification'

type SendResult = { success: boolean; error?: string }

// メールアドレス確認メール送信（#120）
export const sendEmailVerificationEmail = async (params: {
  to: string
  templateParams: EmailVerificationParams
}): Promise<SendResult> => {
  const { to, templateParams } = params
  try {
    const html = renderEmailVerificationHtml(templateParams)
    await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject: EMAIL_SUBJECTS.EMAIL_VERIFICATION,
      html,
    })
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : '不明なエラー'
    console.error('[sendEmailVerificationEmail] 送信失敗:', err)
    return { success: false, error: message }
  }
}
