// 会員登録 API Route Handler
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { findUserByEmail, createUser } from '@/lib/db/users'
import { registerSchema } from '@/lib/validators/auth'
import { BCRYPT_SALT_ROUNDS } from '@/constants/auth'
import { enforceRateLimit } from '@/lib/rateLimit'
import { issueEmailVerificationToken } from '@/lib/db/emailVerificationTokens' // 追加 (#120)
import { sendEmailVerificationEmail } from '@/lib/email/sendEmailVerification' // 追加 (#120)

export const POST = async (req: NextRequest) => {
  // 追加: レート制限（IPごとに一定回数まで）
  const limited = enforceRateLimit('AUTH_REGISTER', req)
  if (limited) return limited

  try {
    const body: unknown = await req.json()

    // Zod バリデーション
    const result = registerSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: '入力内容が正しくありません', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    const { email, name, password } = result.data

    // メールアドレス重複チェック
    const existing = await findUserByEmail(email)
    if (existing) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に使用されています', code: 'EMAIL_ALREADY_EXISTS' },
        { status: 409 }
      )
    }

    // パスワードハッシュ化
    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS)

    // ユーザー作成
    const created = await createUser({ email, name, passwordHash })

    // 追加 (#120): メールアドレス確認トークンを発行＆送信（失敗しても登録は成功扱い）
    try {
      const { token } = await issueEmailVerificationToken(created.id)
      const verifyUrl = `${req.nextUrl.origin}/api/auth/verify-email?token=${encodeURIComponent(token)}`
      await sendEmailVerificationEmail({
        to: email,
        templateParams: { customerName: name ?? 'お客様', verifyUrl },
      })
    } catch (err) {
      console.error('[register] 確認メール送信失敗:', err)
    }

    return NextResponse.json({ message: '会員登録が完了しました' }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
