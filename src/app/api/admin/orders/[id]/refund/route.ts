// 管理者 返金実行 API（#117）
import { NextRequest, NextResponse } from 'next/server'
import { canTransitionOrderStatus } from '@/constants/orders'
import { requireAdmin } from '@/lib/admin-auth'
import {
  findOrderById,
  markOrderRefunded,
  updateOrderStatusIfMatches,
} from '@/lib/db/orders'
import { sendRefundNotificationEmail } from '@/lib/email/sendRefundNotification'
import { stripe } from '@/lib/stripe'

type RouteParams = {
  params: Promise<{ id: string }>
}

// POST /api/admin/orders/:id/refund - 管理者が返金を実行する
// 前提: 注文ステータスが RETURNED であること
export const POST = async (_req: NextRequest, { params }: RouteParams) => {
  const adminCheck = await requireAdmin()
  if ('error' in adminCheck) {
    return NextResponse.json(
      { error: adminCheck.error, code: 'FORBIDDEN' },
      { status: adminCheck.status },
    )
  }

  const { id } = await params

  try {
    const order = await findOrderById(id)
    if (!order) {
      return NextResponse.json({ error: '注文が見つかりません', code: 'NOT_FOUND' }, { status: 404 })
    }
    if (!canTransitionOrderStatus(order.status, 'REFUNDED')) {
      return NextResponse.json(
        { error: 'この注文は返金できる状態ではありません（RETURNED 状態のみ可能）', code: 'INVALID_TRANSITION' },
        { status: 400 },
      )
    }
    if (!order.stripePaymentIntentId) {
      return NextResponse.json(
        { error: 'Stripe決済情報が見つからないため返金できません', code: 'NO_PAYMENT_INTENT' },
        { status: 400 },
      )
    }
    if (order.refundedAt) {
      return NextResponse.json(
        { error: '既に返金処理が完了しています', code: 'ALREADY_REFUNDED' },
        { status: 400 },
      )
    }

    // Stripe で返金実行（金額は注文合計）
    const refund = await stripe.refunds.create({
      payment_intent: order.stripePaymentIntentId,
      amount: order.totalPrice,
    })

    // ステータスを REFUNDED に楽観ロックで遷移
    const count = await updateOrderStatusIfMatches(id, 'RETURNED', 'REFUNDED')
    if (count === 0) {
      // Stripe 返金は成功しているため、ロギングのみで成功扱いにせずクライアントに通知
      console.error('[admin/orders/:id/refund] ステータス更新で競合が発生:', { id, refundId: refund.id })
      return NextResponse.json(
        { error: 'ステータス更新で競合が発生しました。管理画面で状態を確認してください', code: 'STATUS_CHANGED' },
        { status: 409 },
      )
    }

    await markOrderRefunded(id, { amount: order.totalPrice, stripeRefundId: refund.id })

    // 顧客へ返金完了メール送信（失敗してもAPIは成功扱い）
    if (order.user?.email) {
      await sendRefundNotificationEmail({
        to: order.user.email,
        order: {
          id: order.id,
          customerName: order.user.name ?? 'お客様',
          refundedAmount: order.totalPrice,
        },
      })
    }

    const updated = await findOrderById(id)
    return NextResponse.json({ order: updated, refundId: refund.id })
  } catch (err) {
    console.error('[admin/orders/:id/refund POST] エラー:', err)
    return NextResponse.json(
      { error: '返金処理に失敗しました', code: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    )
  }
}
