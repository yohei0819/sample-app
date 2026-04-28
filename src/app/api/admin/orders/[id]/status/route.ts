// 管理画面 注文ステータス変更 API
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { canTransitionOrderStatus } from '@/constants/orders'
import { requireAdmin } from '@/lib/admin-auth'
import { findOrderById, updateOrderStatusIfMatches } from '@/lib/db/orders'
import { sendShipmentNotificationEmail } from '@/lib/email/sendShipmentNotification' // 追加
import type { ShippingAddress } from '@/constants/checkout' // 追加

type RouteParams = {
  params: Promise<{ id: string }>
}

// リクエストバリデーション
const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
})

// PUT /api/admin/orders/:id/status - 注文ステータス変更（遷移妥当性チェック + 楽観ロック）
export const PUT = async (req: NextRequest, { params }: RouteParams) => {
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
        { error: '無効なステータスです', code: 'VALIDATION_ERROR', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { status } = parsed.data

    const existing = await findOrderById(id)
    if (!existing) {
      return NextResponse.json({ error: '注文が見つかりません', code: 'NOT_FOUND' }, { status: 404 })
    }

    // 同一ステータスへの変更は不要
    if (existing.status === status) {
      return NextResponse.json(
        { error: '既に同じステータスです', code: 'BAD_REQUEST' },
        { status: 400 },
      )
    }

    // ステータス遷移の妥当性チェック（例: DELIVERED から PENDING へは戻せない）
    if (!canTransitionOrderStatus(existing.status, status)) {
      return NextResponse.json(
        {
          error: `${existing.status} から ${status} へのステータス変更はできません`,
          code: 'INVALID_TRANSITION',
        },
        { status: 400 },
      )
    }

    // 変更: 楽観ロックでアトミックに更新（他リクエストとのレースコンディションを防止）
    const updatedCount = await updateOrderStatusIfMatches(id, existing.status, status)
    if (updatedCount === 0) {
      // 直前に他者がステータスを変更したため再読み込みが必要
      return NextResponse.json(
        {
          error: '他の操作により注文ステータスが変更されました。画面を更新してください',
          code: 'STATUS_CHANGED',
        },
        { status: 409 },
      )
    }

    const updated = await findOrderById(id)

    // 追加: SHIPPED へ変更された場合は発送通知メールを送信（失敗してもステータス変更は成功扱い）
    if (status === 'SHIPPED' && updated?.user?.email && updated.shippingAddress) {
      await sendShipmentNotificationEmail({
        to: updated.user.email,
        order: {
          id: updated.id,
          shippingAddress: updated.shippingAddress as unknown as ShippingAddress,
        },
      })
    }

    return NextResponse.json({ order: updated })
  } catch (err) {
    console.error('[admin/orders/:id/status PUT] エラー:', err)
    return NextResponse.json(
      { error: '注文ステータスの更新に失敗しました', code: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    )
  }
}
