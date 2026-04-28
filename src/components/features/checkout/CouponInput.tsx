'use client'
// チェックアウト画面 クーポンコード入力コンポーネント
import { useState } from 'react'
import { Tag, X } from 'lucide-react'
import { COUPON_CODE_MAX_LENGTH } from '@/constants/admin' // 追加

type ValidatedCoupon = {
  couponId: string
  code: string
  discountPct: number
}

type Props = {
  onApply: (coupon: ValidatedCoupon | null) => void
  appliedCoupon: ValidatedCoupon | null
}

export const CouponInput = ({ onApply, appliedCoupon }: Props) => {
  const [inputCode, setInputCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleApply = async () => {
    const code = inputCode.trim().toUpperCase()
    if (!code) return

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })

      const json: unknown = await res.json()

      if (!res.ok) {
        const message =
          json !== null &&
          typeof json === 'object' &&
          'error' in json &&
          typeof (json as Record<string, unknown>).error === 'string'
            ? (json as Record<string, string>).error
            : 'クーポンの確認に失敗しました'
        setError(message)
        return
      }

      const { couponId, code: validCode, discountPct } = json as ValidatedCoupon
      onApply({ couponId, code: validCode, discountPct })
      setInputCode('')
    } catch {
      setError('クーポンの確認中にエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemove = () => {
    onApply(null)
    setInputCode('')
    setError(null)
  }

  // 適用済み状態の表示
  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between rounded-md border border-green-300 bg-green-50 px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-green-700">
          <Tag size={14} aria-hidden="true" />
          <span className="font-mono font-medium">{appliedCoupon.code}</span>
          <span>が適用されました（{appliedCoupon.discountPct}% 割引）</span>
        </div>
        <button
          type="button"
          onClick={handleRemove}
          className="ml-2 text-green-600 hover:text-green-800"
          aria-label="クーポンを取り消す"
        >
          <X size={14} />
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium" htmlFor="coupon-code">
        クーポンコード
      </label>
      <div className="flex gap-2">
        <input
          id="coupon-code"
          type="text"
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void handleApply() } }}
          placeholder="例：SUMMER20"
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          aria-describedby={error ? 'coupon-error' : undefined}
          maxLength={COUPON_CODE_MAX_LENGTH} // 変更
        />
        <button
          type="button"
          onClick={() => void handleApply()}
          disabled={isLoading || !inputCode.trim()}
          className="rounded-md border border-input px-4 py-2 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
          aria-busy={isLoading}
        >
          {isLoading ? '確認中...' : '適用'}
        </button>
      </div>
      {error && (
        <p id="coupon-error" role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
