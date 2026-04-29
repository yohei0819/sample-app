// Stripe Webhook 受信 API
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { env } from '@/env'
import { updateOrderToPaidByStripeId } from '@/lib/db/orders'
import { stripe } from '@/lib/stripe'
import { logger } from '@/lib/logger' // 追加

// Next.js App Router では生の body 読み取りのため bodyParser を無効化
export const dynamic = 'force-dynamic'

// POST /api/stripe/webhook
export const POST = async (req: NextRequest) => {
  const body = await req.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'stripe-signature ヘッダーがありません' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    logger.error('[stripe/webhook] 署名検証失敗', { err }) // 変更
    return NextResponse.json({ error: 'Webhook 署名の検証に失敗しました' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await updateOrderToPaidByStripeId(paymentIntent.id)
        break
      }
      case 'payment_intent.payment_failed': {
        // 必要に応じてキャンセル処理などを追加
        break
      }
      default:
        // 未処理イベントは無視
        break
    }
  } catch (err) {
    logger.error('[stripe/webhook] イベント処理エラー', { err }) // 変更
    return NextResponse.json({ error: 'イベント処理に失敗しました' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
