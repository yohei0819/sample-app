// プロフィール取得・更新 API
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { findUserById, updateUser } from '@/lib/db/users'

// プロフィール更新スキーマ
const profileUpdateSchema = z.object({
  name: z.string().min(1, '名前を入力してください').max(50, '名前は50文字以内で入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください'),
})

// GET /api/account/profile
export const GET = async () => {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: '認証が必要です', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  try {
    const user = await findUserById(session.user.id)
    if (!user) {
      return NextResponse.json({ error: 'ユーザーが見つかりません', code: 'NOT_FOUND' }, { status: 404 })
    }
    return NextResponse.json({ user })
  } catch (err) {
    console.error('[account/profile GET] エラー:', err)
    return NextResponse.json({ error: 'プロフィールの取得に失敗しました', code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}

// PATCH /api/account/profile
export const PATCH = async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: '認証が必要です', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  const body: unknown = await req.json()
  const parsed = profileUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'バリデーションエラー', code: 'BAD_REQUEST', issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  try {
    const user = await updateUser(session.user.id, {
      name: parsed.data.name,
      email: parsed.data.email,
    })
    return NextResponse.json({ user })
  } catch (err) {
    console.error('[account/profile PATCH] エラー:', err)
    return NextResponse.json({ error: 'プロフィールの更新に失敗しました', code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}
