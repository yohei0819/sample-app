// 注文詳細取得 API（ログインユーザー本人の注文のみ取得可能）
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { findOrderById } from '@/lib/db/orders'

type RouteParams = {
  params: { id: string }
}

// GET /api/orders/:id
export const GET = async (_req: NextRequest, { params }: RouteParams) => {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: '認証が必要です', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  try {
    const order = await findOrderById(params.id)

    if (!order) {
      return NextResponse.json({ error: '注文が見つかりません', code: 'NOT_FOUND' }, { status: 404 })
    }

    // 本人確認（OWASP A01: 他ユーザーの注文へのアクセスを防ぐ）
    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: '注文が見つかりません', code: 'NOT_FOUND' }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (err) {
    console.error('[orders/:id GET] エラー:', err)
    return NextResponse.json({ error: '注文の取得に失敗しました', code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}
