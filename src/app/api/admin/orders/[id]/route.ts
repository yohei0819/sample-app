// 管理画面 注文詳細 API
// 注: ステータス変更は /api/admin/orders/:id/status (PUT) に一本化済み
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { findOrderById } from '@/lib/db/orders'

type RouteParams = {
  params: Promise<{ id: string }>
}

// GET /api/admin/orders/:id - 注文詳細取得
export const GET = async (_req: NextRequest, { params }: RouteParams) => {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ error: check.error, code: 'FORBIDDEN' }, { status: check.status })
  }

  const { id } = await params

  try {
    const order = await findOrderById(id)
    if (!order) {
      return NextResponse.json({ error: '注文が見つかりません', code: 'NOT_FOUND' }, { status: 404 })
    }
    return NextResponse.json({ order })
  } catch (err) {
    console.error('[admin/orders/:id GET] エラー:', err)
    return NextResponse.json({ error: '注文の取得に失敗しました', code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}
