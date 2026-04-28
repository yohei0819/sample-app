'use client'
// 管理画面 カテゴリ一覧テーブルコンポーネント
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2 } from 'lucide-react'
import type { Category } from '@/generated/prisma/client'

type CategoryWithCount = Category & { _count: { products: number } }

type Props = {
  categories: CategoryWithCount[]
}

export const CategoryTable = ({ categories }: Props) => {
  const router = useRouter()

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`「${name}」を削除してもよいですか？\n※このカテゴリに紐づいている商品のカテゴリは空になります。`)) return

    const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      window.alert('削除に失敗しました')
      return
    }
    router.refresh()
  }

  if (categories.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
        カテゴリがまだありません。
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">カテゴリ名</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">スラッグ</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">商品数</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">操作</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-b last:border-0 transition-colors hover:bg-muted/30">
                <td className="px-4 py-3">
                  <p className="font-medium">{category.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">{category.id.slice(0, 8)}…</p>
                </td>
                <td className="px-4 py-3 font-mono text-muted-foreground">{category.slug}</td>
                <td className="px-4 py-3 text-right">{category._count.products}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <Link
                      href={`/admin/categories/${category.id}/edit`}
                      className="inline-flex items-center gap-1 rounded-md border border-input px-3 py-1 text-xs font-medium transition-colors hover:bg-accent"
                      aria-label={`「${category.name}」を編集`}
                    >
                      <Pencil size={12} aria-hidden="true" />
                      編集
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(category.id, category.name)}
                      className="inline-flex items-center gap-1 rounded-md border border-destructive px-3 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
                      aria-label={`「${category.name}」を削除`}
                    >
                      <Trash2 size={12} aria-hidden="true" />
                      削除
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
