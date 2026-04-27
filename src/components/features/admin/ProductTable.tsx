'use client'
// 管理画面 商品一覧テーブルコンポーネント
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2 } from 'lucide-react'
import type { Category, Product } from '@/generated/prisma/client'

type ProductWithCategory = Product & { category: Category | null }

type Props = {
  products: ProductWithCategory[]
}

export const ProductTable = ({ products }: Props) => {
  const router = useRouter()

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`「${name}」を削除してもよいですか？`)) return

    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      alert('削除に失敗しました')
      return
    }
    router.refresh()
  }

  if (products.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
        商品がまだありません。
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">商品名</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">カテゴリ</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">価格</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">在庫</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">公開</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">操作</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{product.id.slice(0, 8)}…</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {product.category?.name ?? '—'}
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  ¥{product.price.toLocaleString('ja-JP')}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={product.stock === 0 ? 'text-red-500' : ''}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {product.isPublished ? (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                      公開
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                      非公開
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      aria-label={`${product.name}を編集`}
                    >
                      <Pencil size={16} aria-hidden="true" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(product.id, product.name)}
                      className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
                      aria-label={`${product.name}を削除`}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
