// 管理画面 注文一覧 API
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { countOrders, findOrders } from '@/lib/db/orders'
import type { OrderStatus } from '@/generated/prisma/client'

const VALID_STATUSES: OrderStatus[] = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']

// GET /api/admin/orders - 注文一覧取得（フィルター・ページネーション対応）
export const GET = async (req: NextRequest) => {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ error: check.error, code: 'FORBIDDEN' }, { status: check.status })
  }

  const { searchParams } = req.nextUrl
  const statusParam = searchParams.get('status')
  const take = Math.min(Number(searchParams.get('take') ?? 20), 100)
  const skip = Number(searchParams.get('skip') ?? 0)

  const status =
    statusParam && VALID_STATUSES.includes(statusParam as OrderStatus)
      ? (statusParam as OrderStatus)
      : undefined

  try {
    const [orders, total] = await Promise.all([
      findOrders({ status, take, skip }),
      countOrders({ status }),
    ])
    return NextResponse.json({ orders, total })
  } catch (err) {
    console.error('[admin/orders GET] エラー:', err)
    return NextResponse.json({ error: '注文一覧の取得に失敗しました', code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}
