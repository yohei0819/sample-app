// 管理画面 カテゴリ編集ページ（Server Component）
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { CategoryForm } from '@/components/features/admin/CategoryForm'
import { findCategoryById } from '@/lib/db/categories'

export const metadata = {
  title: 'カテゴリ編集 | 管理画面',
}

type Props = {
  params: Promise<{ id: string }>
}

export default async function AdminCategoryEditPage({ params }: Props) {
  const { id } = await params
  const category = await findCategoryById(id)

  if (!category) {
    notFound()
  }

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
        <h1 className="text-2xl font-bold tracking-tight">カテゴリ編集</h1>
        <p className="text-sm text-muted-foreground">「{category.name}」を編集します</p>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <CategoryForm
          categoryId={category.id}
          defaultValues={{ name: category.name, slug: category.slug }}
        />
      </div>
    </div>
  )
}
