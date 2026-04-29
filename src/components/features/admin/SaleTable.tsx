'use client'
// 追加 (#107): タイムセール一覧テーブル（削除ボタン付き）
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

type SaleRow = {
  id: string
  salePrice: number
  startsAt: Date
  endsAt: Date
  isActive: boolean
  product: { id: string; name: string; price: number }
}

type Props = {
  sales: SaleRow[]
}

const formatDate = (d: Date) =>
  new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)

export const SaleTable = ({ sales }: Props) => {
  const router = useRouter()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const now = new Date()

  const handleDelete = async (id: string) => {
    if (!confirm('このセールを削除しますか？')) return
    setPendingId(id)
    const res = await fetch(`/api/admin/sales/${id}`, { method: 'DELETE' })
    setPendingId(null)
    if (!res.ok) {
      alert('削除に失敗しました')
      return
    }
    router.refresh()
  }

  if (sales.length === 0) {
    return (
      <p className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
        セールはまだ登録されていません。
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-card shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left font-medium">商品</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">通常価格</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">セール価格</th>
            <th scope="col" className="px-4 py-3 text-left font-medium">期間</th>
            <th scope="col" className="px-4 py-3 text-left font-medium">状態</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {sales.map((s) => {
            const isActive = s.isActive && s.startsAt <= now && s.endsAt > now
            return (
              <tr key={s.id}>
                <td className="px-4 py-3">{s.product.name}</td>
                <td className="px-4 py-3 text-right">¥{s.product.price.toLocaleString('ja-JP')}</td>
                <td className="px-4 py-3 text-right font-medium text-red-600">
                  ¥{s.salePrice.toLocaleString('ja-JP')}
                </td>
                <td className="px-4 py-3">
                  <div className="text-xs">{formatDate(s.startsAt)}</div>
                  <div className="text-xs text-muted-foreground">〜 {formatDate(s.endsAt)}</div>
                </td>
                <td className="px-4 py-3">
                  {isActive ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-900">
                      開催中
                    </span>
                  ) : !s.isActive ? (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                      無効
                    </span>
                  ) : s.startsAt > now ? (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-900">
                      開始前
                    </span>
                  ) : (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                      終了
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/sales/${s.id}/edit`}
                      className="rounded-md border px-3 py-1 text-xs hover:bg-accent"
                    >
                      編集
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(s.id)}
                      disabled={pendingId === s.id}
                      className="rounded-md border border-red-200 bg-red-50 px-3 py-1 text-xs text-red-700 hover:bg-red-100 disabled:opacity-50"
                    >
                      {pendingId === s.id ? '削除中…' : '削除'}
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
