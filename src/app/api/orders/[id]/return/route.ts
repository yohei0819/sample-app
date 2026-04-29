// 顧客 注文返品申請 API（#117）
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { canTransitionOrderStatus } from '@/constants/orders'
import { findOrderById, updateOrderStatusIfMatches } from '@/lib/db/orders'
import { prisma } from '@/lib/db/prisma'

type RouteParams = {
  params: Promise<{ id: string }>
}

const returnSchema = z.object({
  reason: z.string().min(1, '返品理由を入力してください').max(500),
})

// POST /api/orders/:id/return - 顧客が返品を申請する
export const POST = async (req: NextRequest, { params }: RouteParams) => {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: '認証が必要です', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  const { id } = await params

  try {
    const body: unknown = await req.json()
    const parsed = returnSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: '無効なリクエストです', code: 'VALIDATION_ERROR', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const order = await findOrderById(id)
    if (!order) {
      return NextResponse.json({ error: '注文が見つかりません', code: 'NOT_FOUND' }, { status: 404 })
    }
    // 本人の注文のみ操作可能（OWASP A01: 不適切なアクセス制御）
    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: '注文が見つかりません', code: 'NOT_FOUND' }, { status: 404 })
    }
    // 既に返品申請中・返品受付済・返金済の場合は重複申請不可
    if (!canTransitionOrderStatus(order.status, 'RETURN_REQUESTED')) {
      return NextResponse.json(
        { error: 'この注文は返品申請できない状態です', code: 'INVALID_TRANSITION' },
        { status: 400 },
      )
    }

    // 楽観ロックでステータス更新
    const count = await updateOrderStatusIfMatches(id, order.status, 'RETURN_REQUESTED')
    if (count === 0) {
      return NextResponse.json(
        { error: '他の操作により注文ステータスが変更されました', code: 'STATUS_CHANGED' },
        { status: 409 },
      )
    }

    // 返品理由・申請日時を保存
    await prisma.order.update({
      where: { id },
      data: {
        returnReason: parsed.data.reason,
        returnRequestedAt: new Date(),
      },
    })

    const updated = await findOrderById(id)
    return NextResponse.json({ order: updated })
  } catch (err) {
    console.error('[orders/:id/return POST] エラー:', err)
    return NextResponse.json(
      { error: '返品申請に失敗しました', code: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    )
  }
}
