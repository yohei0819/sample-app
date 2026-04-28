'use client'
// 管理画面 クーポン一覧テーブルコンポーネント
import { useRouter } from 'next/navigation'
import { Ban } from 'lucide-react'
import type { Coupon } from '@/generated/prisma/client'

type CouponWithCount = Coupon & { _count: { orders: number } }

type Props = {
  coupons: CouponWithCount[]
}

export const CouponTable = ({ coupons }: Props) => {
  const router = useRouter()

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    const label = currentActive ? '無効化' : '有効化'
    if (!confirm(`このクーポンを${label}しますか？`)) return

    const res = await fetch(`/api/admin/coupons/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !currentActive }),
    })

    if (!res.ok) {
      window.alert(`クーポンの${label}に失敗しました`)
      return
    }
    router.refresh()
  }

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`クーポン「${code}」を削除してもよいですか？`)) return

    const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      window.alert('削除に失敗しました')
      return
    }
    router.refresh()
  }

  if (coupons.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
        クーポンがまだありません。
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">コード</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">割引率</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">利用数 / 上限</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">有効期限</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">状態</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">操作</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => {
              const isExpired = coupon.expiresAt !== null && coupon.expiresAt < new Date()
              return (
                <tr key={coupon.id} className="border-b last:border-0 transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <span className="font-mono font-medium">{coupon.code}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{coupon.discountPct}%</td>
                  <td className="px-4 py-3 text-right">
                    {coupon.usedCount} / {coupon.maxUses ?? '∞'}
                  </td>
                  <td className="px-4 py-3">
                    {coupon.expiresAt ? (
                      <span className={isExpired ? 'text-destructive' : 'text-muted-foreground'}>
                        {coupon.expiresAt.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">無期限</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        coupon.isActive && !isExpired
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {coupon.isActive && !isExpired ? '有効' : '無効'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(coupon.id, coupon.isActive)}
                        className={`inline-flex items-center gap-1 rounded-md border px-3 py-1 text-xs font-medium transition-colors ${
                          coupon.isActive
                            ? 'border-orange-300 text-orange-600 hover:bg-orange-50'
                            : 'border-green-300 text-green-600 hover:bg-green-50'
                        }`}
                        aria-label={`「${coupon.code}」を${coupon.isActive ? '無効化' : '有効化'}`}
                      >
                        <Ban size={12} aria-hidden="true" />
                        {coupon.isActive ? '無効化' : '有効化'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(coupon.id, coupon.code)}
                        className="inline-flex items-center gap-1 rounded-md border border-destructive px-3 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
                        aria-label={`「${coupon.code}」を削除`}
                      >
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
