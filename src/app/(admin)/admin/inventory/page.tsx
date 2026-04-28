// 管理画面 在庫管理ページ（Server Component）
import { InventoryTable } from '@/components/features/admin/InventoryTable'
import { findAllProductsForAdmin } from '@/lib/db/products'

export const metadata = {
  title: '在庫管理 | 管理画面',
}

export default async function AdminInventoryPage() {
  const products = await findAllProductsForAdmin()

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">在庫管理</h1>
        <p className="text-sm text-muted-foreground">
          商品の在庫数を確認・更新できます。在庫切れ商品は赤くハイライトされます。
        </p>
      </div>

      <InventoryTable products={products} />
    </div>
  )
}
