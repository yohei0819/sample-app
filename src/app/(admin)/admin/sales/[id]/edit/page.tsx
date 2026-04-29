// 追加 (#107): タイムセール編集ページ
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { SaleForm } from '@/components/features/admin/SaleForm'
import { findSaleById } from '@/lib/db/sales'
import { findAllProductsForAdmin } from '@/lib/db/products'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'セール編集 | 管理画面',
}

type Props = {
  params: Promise<{ id: string }>
}

export default async function AdminSaleEditPage({ params }: Props) {
  const { id } = await params
  const [sale, products] = await Promise.all([
    findSaleById(id),
    findAllProductsForAdmin({ take: 200 }),
  ])
  if (!sale) notFound()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/admin/sales"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft size={16} aria-hidden="true" />
          セール一覧に戻る
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">セール編集</h1>
        <p className="text-sm text-muted-foreground">{sale.product.name}</p>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <SaleForm
          saleId={sale.id}
          products={products.map((p) => ({ id: p.id, name: p.name, price: p.price }))}
          defaultValues={{
            productId: sale.productId,
            salePrice: sale.salePrice,
            startsAt: sale.startsAt,
            endsAt: sale.endsAt,
            isActive: sale.isActive,
          }}
        />
      </div>
    </div>
  )
}
