'use client'
// チェックアウトページ（認証チェック + PaymentIntent 取得 + Stripe Elements レンダリング）
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { CheckoutForm } from '@/components/features/checkout/CheckoutForm'
import { useCartStore } from '@/stores/cartStore'

// Stripe publishable key（クライアントサイド）
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '')

// 適用済みクーポン型
type AppliedCoupon = {
  couponId: string
  code: string
  discountPct: number
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice } = useCartStore()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null) // 追加

  useEffect(() => {
    useCartStore.persist.rehydrate()
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    // カートが空の場合はカートページへリダイレクト
    if (items.length === 0) {
      router.replace('/cart')
      return
    }

    // PaymentIntent を(再)作成して clientSecret を取得
    // appliedCoupon が変化するたびに割引後金額で再作成する // 変更
    setClientSecret(null)
    setPaymentIntentId(null)

    const createPaymentIntent = async () => {
      try {
        const res = await fetch('/api/stripe/payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: items.map(({ id, quantity }) => ({ id, quantity })),
            ...(appliedCoupon ? { couponCode: appliedCoupon.code } : {}), // 追加
          }),
        })

        if (res.status === 401) {
          router.replace('/login?redirect=/checkout')
          return
        }

        if (!res.ok) {
          const json: unknown = await res.json()
          const message =
            json !== null && typeof json === 'object' && 'error' in json && typeof (json as Record<string, unknown>).error === 'string'
              ? (json as Record<string, unknown>).error as string
              : '決済の準備に失敗しました'
          setError(message)
          return
        }

        const { clientSecret: secret, paymentIntentId: piId } = (await res.json()) as { clientSecret: string; paymentIntentId: string }
        setClientSecret(secret)
        setPaymentIntentId(piId)
      } catch (err) {
        console.error('[checkout] PaymentIntent 取得エラー:', err)
        setError('決済の準備中にエラーが発生しました')
      }
    }

    void createPaymentIntent()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, appliedCoupon])

  // 税込合計（クーポン割引を考慮） // 変更
  const subtotal = totalPrice()
  const discountAmount = appliedCoupon ? Math.floor(subtotal * (appliedCoupon.discountPct / 100)) : 0
  const discountedSubtotal = subtotal - discountAmount
  const tax = Math.floor(discountedSubtotal * 0.1)
  const totalWithTax = discountedSubtotal + tax

  if (!mounted) return null

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold tracking-tight">チェックアウト</h1>

      {error && (
        <div role="alert" className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* チェックアウトフォーム */}
        <div className="lg:col-span-3">
          {clientSecret && paymentIntentId ? (
            <Elements
              stripe={stripePromise}
              options={{ clientSecret, locale: 'ja' }}
            >
              <CheckoutForm
                clientSecret={clientSecret}
                paymentIntentId={paymentIntentId}
                appliedCoupon={appliedCoupon}
                onCouponApply={setAppliedCoupon}
              />
            </Elements>
          ) : (
            !error && (
              <div className="space-y-4 animate-pulse">
                <div className="h-10 rounded bg-muted" />
                <div className="h-10 rounded bg-muted" />
                <div className="h-32 rounded bg-muted" />
              </div>
            )
          )}
        </div>

        {/* 注文サマリー */}
        <aside className="lg:col-span-2" aria-label="注文サマリー">
          <div className="rounded-lg border bg-card p-6 text-sm">
            <h2 className="mb-4 font-semibold text-base">注文内容</h2>
            <ul className="mb-4 space-y-2">
              {items.map((item) => (
                <li key={item.id} className="flex justify-between gap-2">
                  <span className="text-muted-foreground">
                    {item.name} × {item.quantity}
                  </span>
                  <span>¥{(item.price * item.quantity).toLocaleString()}</span>
                </li>
              ))}
            </ul>
            <hr className="my-3" />
            <div className="space-y-1">
              <div className="flex justify-between text-muted-foreground">
                <span>小計（税抜）</span>
                <span>¥{subtotal.toLocaleString()}</span>
              </div>
              {/* クーポン割引 // 追加 */}
              {appliedCoupon && (
                <div className="flex justify-between text-green-600">
                  <span>割引（{appliedCoupon.discountPct}%）</span>
                  <span>-¥{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>消費税（10%）</span>
                <span>¥{tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-semibold text-base pt-2">
                <span>合計（税込）</span>
                <span>¥{totalWithTax.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
