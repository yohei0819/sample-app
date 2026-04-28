// 管理画面 クーポン一覧ページ（Server Component）
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { CouponTable } from '@/components/features/admin/CouponTable'
import { findAllCoupons } from '@/lib/db/coupons'
import { ADMIN_COUPON_PAGE_SIZE } from '@/constants/admin' // 追加

export const metadata = {
  title: 'クーポン管理 | 管理画面',
}

export default async function AdminCouponsPage() {
  const coupons = await findAllCoupons(ADMIN_COUPON_PAGE_SIZE) // 変更

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">クーポン管理</h1>
          <p className="text-sm text-muted-foreground">クーポンの一覧・作成・無効化・削除</p>
        </div>
        <Link
          href="/admin/coupons/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus size={16} aria-hidden="true" />
          新規作成
        </Link>
      </div>

      <CouponTable coupons={coupons} />
    </div>
  )
}
