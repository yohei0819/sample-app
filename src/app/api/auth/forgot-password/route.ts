// パスワードリセット要求 API（#129）
import { NextRequest, NextResponse } from 'next/server'
import { findUserByEmail } from '@/lib/db/users'
import { issuePasswordResetToken } from '@/lib/db/passwordResetTokens'
import { sendPasswordResetEmail } from '@/lib/email/sendPasswordReset'
import { forgotPasswordSchema } from '@/lib/validators/auth'
import { enforceRateLimit } from '@/lib/rateLimit'

export const POST = async (req: NextRequest) => {
  // ブルートフォース対策: 5分に1回（IP単位）
  const limited = enforceRateLimit('PASSWORD_RESET_REQUEST', req)
  if (limited) return limited

  try {
    const body: unknown = await req.json()
    const parsed = forgotPasswordSchema.safeParse(body)
    if (!parsed.success) {
      // メール列挙対策: バリデーション失敗時も同じ成功レスポンスを返す
      return NextResponse.json(
        { message: 'リクエストを受け付けました。該当のメールアドレスにご案内を送信します。' },
        { status: 200 },
      )
    }
    const { email } = parsed.data

    // ユーザーが存在する場合のみトークン発行＆メール送信。失敗してもクライアントには成功レスポンス
    const user = await findUserByEmail(email)
    if (user && user.isActive !== false) {
      try {
        const { token } = await issuePasswordResetToken(user.id)
        const resetUrl = `${req.nextUrl.origin}/reset-password?token=${encodeURIComponent(token)}`
        await sendPasswordResetEmail({
          to: email,
          templateParams: {
            customerName: user.name ?? 'お客様',
            resetUrl,
          },
        })
      } catch (err) {
        console.error('[forgot-password] トークン発行/メール送信失敗:', err)
      }
    }

    // メールアドレス列挙を防ぐため、結果に関わらず常に同じレスポンス
    return NextResponse.json(
      { message: 'リクエストを受け付けました。該当のメールアドレスにご案内を送信します。' },
      { status: 200 },
    )
  } catch {
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました', code: 'INTERNAL_ERROR' },
      { status: 500 },
    )
  }
}
