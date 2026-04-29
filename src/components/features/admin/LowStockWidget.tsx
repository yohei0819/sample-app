// 追加 (#106): 在庫アラートウィジェット（ダッシュボード用 Server Component）
import Link from 'next/link'
import { findLowStockProducts } from '@/lib/db/stockMovements'

export const LowStockWidget = async () => {
  const products = await findLowStockProducts({ take: 10 })

  return (
    <section
      aria-labelledby="low-stock-heading"
      className="rounded-lg border bg-card p-6 shadow-sm"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 id="low-stock-heading" className="text-lg font-semibold">
          在庫アラート
        </h2>
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
          {products.length} 件
        </span>
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-muted-foreground">在庫が閾値を下回る商品はありません。</p>
      ) : (
        <ul className="divide-y">
          {products.map((p) => (
            <li key={p.id} className="flex items-center justify-between py-2">
              <Link
                href={`/admin/products/${p.id}/edit`}
                className="text-sm font-medium hover:underline"
              >
                {p.name}
              </Link>
              <span
                className={`text-sm ${p.stock === 0 ? 'text-red-600 font-semibold' : 'text-amber-700'}`}
              >
                残 {p.stock} / 閾値 {p.lowStockThreshold}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
