// 顧客 注文キャンセル API（#130）
// PENDING/PAID 状態に限り顧客自身がキャンセル可能。
// PAID の場合は Stripe で全額返金を実行し、REFUNDED に遷移。
// PENDING の場合は CANCELLED に遷移。在庫は両ケースで復元する。
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { findOrderById } from '@/lib/db/orders'
import { prisma } from '@/lib/db/prisma'
import { stripe } from '@/lib/stripe'
import { recordAuditLog } from '@/lib/audit'
import { AuditAction } from '@/generated/prisma/enums'

type RouteParams = {
  params: Promise<{ id: string }>
}

// POST /api/orders/:id/cancel - 顧客が注文をキャンセル
export const POST = async (_req: NextRequest, { params }: RouteParams) => {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: '認証が必要です', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  const { id } = await params

  try {
    const order = await findOrderById(id)
    if (!order) {
      return NextResponse.json({ error: '注文が見つかりません', code: 'NOT_FOUND' }, { status: 404 })
    }
    // 本人の注文のみ操作可能
    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: '注文が見つかりません', code: 'NOT_FOUND' }, { status: 404 })
    }

    // キャンセル可能ステータス（PENDING/PAID のみ）
    if (order.status !== 'PENDING' && order.status !== 'PAID') {
      return NextResponse.json(
        {
          error: 'この注文はキャンセルできない状態です（発送済みの場合は返品申請をご利用ください）',
          code: 'CANNOT_CANCEL',
        },
        { status: 403 },
      )
    }

    const isPaid = order.status === 'PAID'
    const newStatus = isPaid ? 'REFUNDED' : 'CANCELLED'

    // Stripe 返金（PAID のみ・トランザクション外で実施）
    let stripeRefundId: string | null = null
    if (isPaid) {
      if (!order.stripePaymentIntentId) {
        return NextResponse.json(
          { error: 'Stripe決済情報が見つからないためキャンセルできません', code: 'NO_PAYMENT_INTENT' },
          { status: 400 },
        )
      }
      try {
        const refund = await stripe.refunds.create({
          payment_intent: order.stripePaymentIntentId,
          amount: order.totalPrice,
        })
        stripeRefundId = refund.id
      } catch (err) {
        console.error('[orders/:id/cancel] Stripe返金失敗:', err)
        return NextResponse.json(
          { error: '返金処理に失敗しました。時間をおいて再度お試しください', code: 'REFUND_FAILED' },
          { status: 500 },
        )
      }
    }

    // 楽観ロック付きでステータス更新 + 在庫復元 + 監査ログをトランザクションで実施
    try {
      await prisma.$transaction(async (tx) => {
        // ステータス更新（楽観ロック）
        const result = await tx.order.updateMany({
          where: { id, status: order.status },
          data: {
            status: newStatus,
            ...(isPaid && stripeRefundId
              ? {
                  refundedAmount: order.totalPrice,
                  refundedAt: new Date(),
                  stripeRefundId,
                }
              : {}),
          },
        })
        if (result.count === 0) {
          throw new Error('STATUS_CHANGED')
        }

        // 在庫復元（注文明細の数量を商品在庫に戻す）
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          })
        }

        // 監査ログ
        await recordAuditLog({
          actorId: session.user.id,
          action: AuditAction.ORDER_STATUS_CHANGE,
          targetType: 'Order',
          targetId: id,
          metadata: {
            from: order.status,
            to: newStatus,
            cancelledByCustomer: true,
            ...(stripeRefundId ? { stripeRefundId } : {}),
          },
          tx,
        })
      })
    } catch (err) {
      // ステータス競合は 409、それ以外は 500
      if (err instanceof Error && err.message === 'STATUS_CHANGED') {
        return NextResponse.json(
          { error: '他の操作により注文状態が変わりました。再度ご確認ください', code: 'STATUS_CHANGED' },
          { status: 409 },
        )
      }
      console.error('[orders/:id/cancel] DBトランザクション失敗:', err)
      return NextResponse.json(
        { error: 'キャンセル処理に失敗しました', code: 'INTERNAL_SERVER_ERROR' },
        { status: 500 },
      )
    }

    const updated = await findOrderById(id)
    return NextResponse.json({ order: updated, refundId: stripeRefundId })
  } catch (err) {
    console.error('[orders/:id/cancel POST] エラー:', err)
    return NextResponse.json(
      { error: 'キャンセル処理に失敗しました', code: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    )
  }
}
