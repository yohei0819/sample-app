// 管理画面 ユーザー一覧 API
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { findAllUsers } from '@/lib/db/users'

// GET /api/admin/users - ユーザー一覧取得
export const GET = async () => {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ error: check.error, code: 'FORBIDDEN' }, { status: check.status })
  }

  try {
    const users = await findAllUsers()
    return NextResponse.json({ users })
  } catch (err) {
    console.error('[admin/users GET] エラー:', err)
    return NextResponse.json(
      { error: 'ユーザー一覧の取得に失敗しました', code: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    )
  }
}
