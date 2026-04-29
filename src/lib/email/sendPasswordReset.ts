// パスワードリセットメール送信（#129）
import 'server-only'
import { resend } from '@/lib/email/client'
import { env } from '@/env'
import { EMAIL_SUBJECTS } from '@/constants/email'
import {
  renderPasswordResetHtml,
  type PasswordResetParams,
} from '@/lib/email/templates/passwordReset'

type SendResult = { success: boolean; error?: string }

export const sendPasswordResetEmail = async (params: {
  to: string
  templateParams: PasswordResetParams
}): Promise<SendResult> => {
  const { to, templateParams } = params
  try {
    const html = renderPasswordResetHtml(templateParams)
    await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject: EMAIL_SUBJECTS.PASSWORD_RESET,
      html,
    })
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : '不明なエラー'
    console.error('[sendPasswordResetEmail] 送信失敗:', err)
    return { success: false, error: message }
  }
}
