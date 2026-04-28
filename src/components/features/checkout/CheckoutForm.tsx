'use client'
// チェックアウトフォームコンポーネント（配送先入力 + Stripe Elements）
import { zodResolver } from '@hookform/resolvers/zod'
import {
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { CHECKOUT_SUCCESS_PATH } from '@/constants/checkout'
import { useCartStore } from '@/stores/cartStore'
import { CouponInput } from './CouponInput' // 追加

// 配送先フォームのバリデーションスキーマ
const shippingSchema = z.object({
  name: z.string().min(1, 'お名前を入力してください'),
  phone: z.string().min(10, '電話番号を入力してください').max(15),
  postalCode: z.string().regex(/^\d{7}$/, '郵便番号は7桁の数字で入力してください'),
  prefecture: z.string().min(1, '都道府県を入力してください'),
  city: z.string().min(1, '市区町村を入力してください'),
  addressLine1: z.string().min(1, '番地を入力してください'),
  addressLine2: z.string().optional(),
})

type ShippingFormValues = z.infer<typeof shippingSchema>

// 適用済みクーポン型 // 追加
type AppliedCoupon = {
  couponId: string
  code: string
  discountPct: number
}

type Props = {
  clientSecret: string
  paymentIntentId: string
  appliedCoupon: AppliedCoupon | null // 追加
  onCouponApply: (coupon: AppliedCoupon | null) => void // 追加
}

export const CheckoutForm = ({ clientSecret, paymentIntentId, appliedCoupon, onCouponApply }: Props) => {
  const router = useRouter()
  const stripeInstance = useStripe()
  const elements = useElements()
  const { clearCart, items } = useCartStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
  })

  const onSubmit = async (data: ShippingFormValues) => {
    if (!stripeInstance || !elements) return

    setIsProcessing(true)
    setPaymentError(null)

    // Stripe Elements の入力確定
    const { error: submitError } = await elements.submit()
    if (submitError) {
      setPaymentError(submitError.message ?? '決済情報の確認に失敗しました')
      setIsProcessing(false)
      return
    }

    // 注文を DB に保存（配送先情報 + PaymentIntent ID）
    const orderRes = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map(({ id, quantity }) => ({ id, quantity })),
        shippingAddress: data,
        stripePaymentIntentId: paymentIntentId,
        ...(appliedCoupon ? { couponCode: appliedCoupon.code } : {}), // 追加
      }),
    })

    if (!orderRes.ok) {
      const json: unknown = await orderRes.json()
      const message =
        json !== null && typeof json === 'object' && 'error' in json && typeof (json as Record<string, unknown>).error === 'string'
          ? (json as Record<string, unknown>).error as string
          : '注文の作成に失敗しました'
      setPaymentError(message)
      setIsProcessing(false)
      return
    }

    // 決済実行
    const { error } = await stripeInstance.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}${CHECKOUT_SUCCESS_PATH}`,
      },
    })

    if (error) {
      setPaymentError(error.message ?? '決済に失敗しました')
      setIsProcessing(false)
      return
    }

    // 成功時はカートをクリア（リダイレクト前）
    clearCart()
    router.push(CHECKOUT_SUCCESS_PATH)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
      {/* 配送先情報 */}
      <section aria-labelledby="shipping-heading">
        <h2 id="shipping-heading" className="mb-4 text-lg font-semibold">
          配送先情報
        </h2>
        <div className="space-y-4">
          {/* お名前 */}
          <div className="space-y-1">
            <label htmlFor="name" className="block text-sm font-medium">
              お名前 <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              autoComplete="name"
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <p id="name-error" role="alert" className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* 電話番号 */}
          <div className="space-y-1">
            <label htmlFor="phone" className="block text-sm font-medium">
              電話番号 <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              {...register('phone')}
              autoComplete="tel"
              placeholder="09012345678"
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              aria-describedby={errors.phone ? 'phone-error' : undefined}
            />
            {errors.phone && (
              <p id="phone-error" role="alert" className="text-xs text-red-500">{errors.phone.message}</p>
            )}
          </div>

          {/* 郵便番号 */}
          <div className="space-y-1">
            <label htmlFor="postalCode" className="block text-sm font-medium">
              郵便番号 <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="postalCode"
              type="text"
              {...register('postalCode')}
              autoComplete="postal-code"
              placeholder="1234567"
              maxLength={7}
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              aria-describedby={errors.postalCode ? 'postal-code-error' : undefined}
            />
            {errors.postalCode && (
              <p id="postal-code-error" role="alert" className="text-xs text-red-500">{errors.postalCode.message}</p>
            )}
          </div>

          {/* 都道府県・市区町村 */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="prefecture" className="block text-sm font-medium">
                都道府県 <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                id="prefecture"
                type="text"
                {...register('prefecture')}
                autoComplete="address-level1"
                placeholder="東京都"
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                aria-describedby={errors.prefecture ? 'prefecture-error' : undefined}
              />
              {errors.prefecture && (
                <p id="prefecture-error" role="alert" className="text-xs text-red-500">{errors.prefecture.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <label htmlFor="city" className="block text-sm font-medium">
                市区町村 <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                id="city"
                type="text"
                {...register('city')}
                autoComplete="address-level2"
                placeholder="渋谷区"
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                aria-describedby={errors.city ? 'city-error' : undefined}
              />
              {errors.city && (
                <p id="city-error" role="alert" className="text-xs text-red-500">{errors.city.message}</p>
              )}
            </div>
          </div>

          {/* 番地 */}
          <div className="space-y-1">
            <label htmlFor="addressLine1" className="block text-sm font-medium">
              番地 <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="addressLine1"
              type="text"
              {...register('addressLine1')}
              autoComplete="address-line1"
              placeholder="1-2-3"
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              aria-describedby={errors.addressLine1 ? 'address-line1-error' : undefined}
            />
            {errors.addressLine1 && (
              <p id="address-line1-error" role="alert" className="text-xs text-red-500">{errors.addressLine1.message}</p>
            )}
          </div>

          {/* 建物名・部屋番号（任意） */}
          <div className="space-y-1">
            <label htmlFor="addressLine2" className="block text-sm font-medium">
              建物名・部屋番号
            </label>
            <input
              id="addressLine2"
              type="text"
              {...register('addressLine2')}
              autoComplete="address-line2"
              placeholder="○○マンション 101号室"
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </section>

      {/* クーポンコード入力 */}
      <CouponInput appliedCoupon={appliedCoupon} onApply={onCouponApply} />

      {/* 決済情報 */}
      <section aria-labelledby="payment-heading">
        <h2 id="payment-heading" className="mb-4 text-lg font-semibold">
          お支払い情報
        </h2>
        <div className="rounded-md border p-4">
          <PaymentElement />
        </div>
      </section>

      {/* エラーメッセージ */}
      {paymentError && (
        <div
          role="alert"
          className="rounded-md bg-red-50 p-3 text-sm text-red-600"
        >
          {paymentError}
        </div>
      )}

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={isProcessing || !stripeInstance || !elements}
        className="w-full rounded-md bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        aria-busy={isProcessing}
      >
        {isProcessing ? '決済処理中...' : '注文を確定する'}
      </button>
    </form>
  )
}
