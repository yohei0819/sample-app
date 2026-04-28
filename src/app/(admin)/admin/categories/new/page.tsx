// 管理画面 カテゴリ新規作成ページ（Server Component）
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { CategoryForm } from '@/components/features/admin/CategoryForm'

export const metadata = {
  title: 'カテゴリ新規作成 | 管理画面',
}

export default function AdminCategoryNewPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/admin/categories"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          aria-label="カテゴリ管理に戻る"
        >
          <ChevronLeft size={16} aria-hidden="true" />
          カテゴリ管理
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">カテゴリ新規作成</h1>
        <p className="text-sm text-muted-foreground">新しいカテゴリを作成します</p>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <CategoryForm />
      </div>
    </div>
  )
}
