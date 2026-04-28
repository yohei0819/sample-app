// 管理画面 カテゴリ一覧ページ（Server Component）
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { CategoryTable } from '@/components/features/admin/CategoryTable'
import { findAllCategoriesWithCount } from '@/lib/db/categories'

export const metadata = {
  title: 'カテゴリ管理 | 管理画面',
}

export default async function AdminCategoriesPage() {
  const categories = await findAllCategoriesWithCount()

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">カテゴリ管理</h1>
          <p className="text-sm text-muted-foreground">カテゴリの一覧・作成・編集・削除</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus size={16} aria-hidden="true" />
          新規作成
        </Link>
      </div>

      <CategoryTable categories={categories} />
    </div>
  )
}
