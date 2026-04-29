// メール確認リンク 再送 API（#120）
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { env } from '@/env'
import { enforceRateLimit } from '@/lib/rateLimit'
import { prisma } from '@/lib/db/prisma'
import { issueEmailVerificationToken } from '@/lib/db/emailVerificationTokens'
import { sendEmailVerificationEmail } from '@/lib/email/sendEmailVerification'

// POST /api/auth/verify-email/resend - ログイン中ユーザーが確認リンクを再送する
export const POST = async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: '認証が必要です', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  const limited = enforceRateLimit('EMAIL_VERIFY_RESEND', req)
  if (limited) return limited

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true, emailVerifiedAt: true },
    })
    if (!user) {
      return NextResponse.json({ error: 'ユーザーが見つかりません', code: 'NOT_FOUND' }, { status: 404 })
    }
    if (user.emailVerifiedAt) {
      return NextResponse.json(
        { error: '既にメールアドレスは確認済みです', code: 'ALREADY_VERIFIED' },
        { status: 400 },
      )
    }

    const { token } = await issueEmailVerificationToken(user.id)
    const verifyUrl = `${env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${encodeURIComponent(token)}`
    const result = await sendEmailVerificationEmail({
      to: user.email,
      templateParams: { customerName: user.name ?? 'お客様', verifyUrl },
    })
    if (!result.success) {
      return NextResponse.json(
        { error: 'メール送信に失敗しました', code: 'EMAIL_SEND_FAILED' },
        { status: 500 },
      )
    }

    return NextResponse.json({ message: '確認メールを再送しました' })
  } catch (err) {
    console.error('[verify-email/resend POST] エラー:', err)
    return NextResponse.json(
      { error: '再送に失敗しました', code: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    )
  }
}
