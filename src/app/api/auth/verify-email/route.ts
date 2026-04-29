// メールアドレス確認 API（#120）
import { NextRequest, NextResponse } from 'next/server'
import { consumeEmailVerificationToken } from '@/lib/db/emailVerificationTokens'

// GET /api/auth/verify-email?token=...
// 成功時はログインページにリダイレクト
export const GET = async (req: NextRequest) => {
  const token = req.nextUrl.searchParams.get('token')
  const baseUrl = req.nextUrl.origin

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/login?verified=invalid`)
  }

  try {
    const result = await consumeEmailVerificationToken(token)
    if (!result.ok) {
      const reason = result.reason === 'EXPIRED' ? 'expired' : 'invalid'
      return NextResponse.redirect(`${baseUrl}/login?verified=${reason}`)
    }
    return NextResponse.redirect(`${baseUrl}/login?verified=success`)
  } catch (err) {
    console.error('[verify-email GET] エラー:', err)
    return NextResponse.redirect(`${baseUrl}/login?verified=error`)
  }
}
