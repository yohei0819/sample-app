// パスワード再設定 API（#129）
import { NextRequest, NextResponse } from 'next/server'
import { consumePasswordResetToken } from '@/lib/db/passwordResetTokens'
import { resetPasswordSchema } from '@/lib/validators/auth'
import { enforceRateLimit } from '@/lib/rateLimit'

export const POST = async (req: NextRequest) => {
  // ブルートフォース対策: IP 単位で 1分10回まで
  const limited = enforceRateLimit('PASSWORD_RESET_CONSUME', req)
  if (limited) return limited

  try {
    const body: unknown = await req.json()
    const parsed = resetPasswordSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: '入力内容が正しくありません', code: 'VALIDATION_ERROR' },
        { status: 400 },
      )
    }
    const { token, password } = parsed.data

    const result = await consumePasswordResetToken(token, password)
    if (!result.ok) {
      // 全ての失敗を「無効なリンクです」に統一（情報漏洩を防ぐ）
      return NextResponse.json(
        {
          error: 'リンクが無効か、有効期限が切れています。再度リセットを依頼してください。',
          code: 'INVALID_TOKEN',
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { message: 'パスワードを更新しました。新しいパスワードでログインしてください。' },
      { status: 200 },
    )
  } catch {
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました', code: 'INTERNAL_ERROR' },
      { status: 500 },
    )
  }
}
