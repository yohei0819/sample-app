// 管理画面 クーポン新規作成ページ（Server Component）
import { CouponForm } from '@/components/features/admin/CouponForm'

export const metadata = {
  title: 'クーポン新規作成 | 管理画面',
}

export default function AdminCouponsNewPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">クーポン新規作成</h1>
        <p className="text-sm text-muted-foreground">新しいクーポンコードを発行します</p>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <CouponForm />
      </div>
    </div>
  )
}
