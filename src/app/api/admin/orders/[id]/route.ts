// 管理画面 注文詳細・ステータス変更 API
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin-auth'
import { findOrderById, updateOrderStatus } from '@/lib/db/orders'

type RouteParams = {
  params: Promise<{ id: string }>
}

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
})

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

// PATCH /api/admin/orders/:id - 注文ステータス変更
export const PATCH = async (req: NextRequest, { params }: RouteParams) => {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ error: check.error, code: 'FORBIDDEN' }, { status: check.status })
  }

  const { id } = await params

  try {
    const body: unknown = await req.json()
    const parsed = updateStatusSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: '無効なステータスです', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { status } = parsed.data

    const existing = await findOrderById(id)
    if (!existing) {
      return NextResponse.json({ error: '注文が見つかりません', code: 'NOT_FOUND' }, { status: 404 })
    }

    // キャンセル済みの注文は変更不可
    if (existing.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'キャンセル済みの注文はステータスを変更できません', code: 'BAD_REQUEST' },
        { status: 400 },
      )
    }

    const updated = await updateOrderStatus(id, status)
    return NextResponse.json({ order: updated })
  } catch (err) {
    console.error('[admin/orders/:id PATCH] エラー:', err)
    return NextResponse.json(
      { error: '注文ステータスの更新に失敗しました', code: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    )
  }
}
