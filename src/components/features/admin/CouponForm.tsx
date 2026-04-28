'use client'
// 管理画面 クーポンフォームコンポーネント（新規作成用）
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { couponSchema, type CouponFormValues } from '@/lib/validators/coupon'

export const CouponForm = () => {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: '',
      discountPct: 10,
      maxUses: null,
      expiresAt: null,
      isActive: true as boolean,
    },
  })

  const onSubmit = async (data: CouponFormValues) => {
    const res = await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const json: unknown = await res.json()
      const message =
        json !== null &&
        typeof json === 'object' &&
        'error' in json &&
        typeof (json as Record<string, unknown>).error === 'string'
          ? (json as Record<string, string>).error
          : 'クーポンの作成に失敗しました'
      window.alert(message)
      return
    }

    router.push('/admin/coupons')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
      {/* クーポンコード */}
      <div className="space-y-1">
        <label htmlFor="code" className="text-sm font-medium">
          クーポンコード <span className="text-destructive" aria-hidden="true">*</span>
        </label>
        <input
          id="code"
          type="text"
          placeholder="例：SUMMER20"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          aria-describedby={errors.code ? 'code-error' : undefined}
          {...register('code')}
        />
        {errors.code && (
          <p id="code-error" role="alert" className="text-sm text-destructive">{errors.code.message}</p>
        )}
        <p className="text-xs text-muted-foreground">大文字英数字・アンダースコア・ハイフンのみ（例：SUMMER20、SALE_10）</p>
      </div>

      {/* 割引率 */}
      <div className="space-y-1">
        <label htmlFor="discountPct" className="text-sm font-medium">
          割引率（%） <span className="text-destructive" aria-hidden="true">*</span>
        </label>
        <input
          id="discountPct"
          type="number"
          min={1}
          max={100}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          aria-describedby={errors.discountPct ? 'discountPct-error' : undefined}
          {...register('discountPct', { valueAsNumber: true })}
        />
        {errors.discountPct && (
          <p id="discountPct-error" role="alert" className="text-sm text-destructive">{errors.discountPct.message}</p>
        )}
      </div>

      {/* 最大利用回数（任意） */}
      <div className="space-y-1">
        <label htmlFor="maxUses" className="text-sm font-medium">
          最大利用回数
        </label>
        <input
          id="maxUses"
          type="number"
          min={1}
          placeholder="空欄で無制限"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          aria-describedby={errors.maxUses ? 'maxUses-error' : undefined}
          {...register('maxUses', {
            setValueAs: (v: string) => (v === '' ? null : Number(v)),
          })}
        />
        {errors.maxUses && (
          <p id="maxUses-error" role="alert" className="text-sm text-destructive">{errors.maxUses.message}</p>
        )}
      </div>

      {/* 有効期限（任意） */}
      <div className="space-y-1">
        <label htmlFor="expiresAt" className="text-sm font-medium">
          有効期限
        </label>
        <input
          id="expiresAt"
          type="datetime-local"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          aria-describedby={errors.expiresAt ? 'expiresAt-error' : undefined}
          {...register('expiresAt', {
            setValueAs: (v: string) => (v === '' ? null : new Date(v).toISOString()),
          })}
        />
        {errors.expiresAt && (
          <p id="expiresAt-error" role="alert" className="text-sm text-destructive">{errors.expiresAt.message as string}</p>
        )}
      </div>

      {/* 送信・キャンセルボタン */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting ? '作成中...' : '作成する'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/coupons')}
          className="inline-flex items-center rounded-md border border-input px-6 py-2 text-sm font-medium transition-colors hover:bg-accent"
        >
          キャンセル
        </button>
      </div>
    </form>
  )
}
