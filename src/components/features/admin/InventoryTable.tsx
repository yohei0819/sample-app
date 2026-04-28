'use client'
// 管理画面 在庫管理テーブルコンポーネント
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle } from 'lucide-react'
import type { Category, Product } from '@/generated/prisma/client'
import { STOCK_LOW_THRESHOLD } from '@/constants/admin'

type ProductWithCategory = Product & { category: Category | null }

type Props = {
  products: ProductWithCategory[]
}

type StockEdit = Record<string, number>

export const InventoryTable = ({ products }: Props) => {
  const router = useRouter()
  // 在庫編集中の値を管理（productId → 入力中のstock値）
  const [edits, setEdits] = useState<StockEdit>({})
  const [saving, setSaving] = useState(false)

  const handleChange = (id: string, value: string) => {
    const num = parseInt(value, 10)
    setEdits((prev) => ({ ...prev, [id]: isNaN(num) ? 0 : Math.max(0, num) }))
  }

  const handleSave = async () => {
    const items = Object.entries(edits).map(([id, stock]) => ({ id, stock }))
    if (items.length === 0) return

    setSaving(true)
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
      if (!res.ok) {
        window.alert('在庫の更新に失敗しました')
        return
      }
      setEdits({})
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  if (products.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
        商品がまだありません。
      </div>
    )
  }

  const hasChanges = Object.keys(edits).length > 0

  return (
    <div className="space-y-4">
      {/* 変更がある場合に保存ボタンを表示 */}
      {hasChanges && (
        <div className="flex items-center justify-between rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-800">
            {Object.keys(edits).length}件の在庫変更があります
          </p>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="在庫変更を一括保存する"
          >
            {saving ? '保存中…' : '変更を保存'}
          </button>
        </div>
      )}

      <div className="rounded-lg border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">商品名</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">カテゴリ</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">在庫数</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">状態</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const currentStock = edits[product.id] ?? product.stock
                const isOutOfStock = currentStock === 0
                const isLowStock = currentStock > 0 && currentStock <= STOCK_LOW_THRESHOLD
                const isEditing = product.id in edits

                return (
                  <tr
                    key={product.id}
                    className={`border-b last:border-0 transition-colors ${isOutOfStock ? 'bg-red-50 hover:bg-red-100/50' : 'hover:bg-muted/30'}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {isOutOfStock && (
                          <AlertTriangle size={14} className="shrink-0 text-destructive" aria-hidden="true" />
                        )}
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="font-mono text-xs text-muted-foreground">{product.id.slice(0, 8)}…</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {product.category?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <input
                        type="number"
                        min={0}
                        value={currentStock}
                        onChange={(e) => handleChange(product.id, e.target.value)}
                        className={`w-24 rounded-md border px-2 py-1 text-right text-sm focus:outline-none focus:ring-2 focus:ring-ring ${isEditing ? 'border-amber-400 bg-amber-50' : 'border-input bg-background'}`}
                        aria-label={`${product.name}の在庫数`}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isOutOfStock ? (
                        <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                          在庫切れ
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                          残りわずか
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          在庫あり
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
