'use client'
// 管理画面 レビュー一覧テーブルコンポーネント
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image' // 追加 (#132)
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { StarRating } from '@/components/features/review/StarRating'
import { ADMIN_REVIEW_PAGE_SIZE } from '@/constants/admin'
import type { AdminReview } from '@/lib/db/reviews'

type Props = {
  reviews: AdminReview[]
  total: number
  currentPage: number
  currentFilter: string
}

const FILTER_OPTIONS = [
  { value: '', label: 'すべて' },
  { value: 'true', label: '公開中' },
  { value: 'false', label: '非公開' },
]

export const AdminReviewTable = ({ reviews, total, currentPage, currentFilter }: Props) => {
  const router = useRouter()
  const totalPages = Math.ceil(total / ADMIN_REVIEW_PAGE_SIZE)

  const buildUrl = (page: number, filter: string) => {
    const params = new URLSearchParams()
    if (filter) params.set('isPublic', filter)
    if (page > 1) params.set('page', String(page))
    const query = params.toString()
    return `/admin/reviews${query ? `?${query}` : ''}`
  }

  const handleFilterChange = (filter: string) => {
    router.push(buildUrl(1, filter))
  }

  // 変更: APIエラー時にユーザーへフィードバックを表示する
  const handleToggleVisibility = async (id: string, current: boolean) => {
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublic: !current }),
    })
    if (!res.ok) {
      window.alert('更新に失敗しました。再度お試しください。')
      return
    }
    router.refresh()
  }

  // 変更: APIエラー時にユーザーへフィードバックを表示する
  const handleDelete = async (id: string) => {
    if (!window.confirm('このレビューを削除しますか？')) return
    const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      window.alert('削除に失敗しました。再度お試しください。')
      return
    }
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* フィルター */}
      <div className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleFilterChange(opt.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              currentFilter === opt.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/70'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
          レビューがまだありません。
        </div>
      ) : (
        <>
          {/* テーブル */}
          <div className="rounded-lg border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">商品</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">投稿者</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">評価</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">コメント</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">画像</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">投稿日</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">状態</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {reviews.map((review) => (
                    <tr key={review.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 max-w-[120px] truncate font-medium">
                        {review.product.name}
                      </td>
                      <td className="px-4 py-3 max-w-[120px] truncate text-muted-foreground">
                        {review.user.name ?? review.user.email}
                      </td>
                      <td className="px-4 py-3">
                        <StarRating mode="display" rating={review.rating} size="sm" />
                      </td>
                      <td className="px-4 py-3 max-w-[200px] truncate text-muted-foreground">
                        {review.comment ?? '—'}
                      </td>
                      {/* 追加 (#132): 画像サムネイル（公開状態は isPublic で一括管理） */}
                      <td className="px-4 py-3">
                        {review.images && review.images.length > 0 ? (
                          <div className="flex gap-1">
                            {review.images.slice(0, 3).map((url) => (
                              <div key={url} className="relative h-10 w-10 overflow-hidden rounded">
                                <Image
                                  src={url}
                                  alt="レビュー画像"
                                  fill
                                  sizes="40px"
                                  className="object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            review.isPublic
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {review.isPublic ? '公開中' : '非公開'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleVisibility(review.id, review.isPublic)}
                            className="text-xs text-primary underline-offset-2 hover:underline"
                          >
                            {review.isPublic ? '非公開にする' : '公開する'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(review.id)}
                            className="text-xs text-destructive underline-offset-2 hover:underline"
                          >
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

          {/* ページネーション */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                全 {total} 件中 {(currentPage - 1) * ADMIN_REVIEW_PAGE_SIZE + 1}〜
                {Math.min(currentPage * ADMIN_REVIEW_PAGE_SIZE, total)} 件を表示
              </p>
              <div className="flex items-center gap-1">
                <Link
                  href={buildUrl(currentPage - 1, currentFilter)}
                  aria-label="前のページ"
                  aria-disabled={currentPage <= 1}
                  tabIndex={currentPage <= 1 ? -1 : undefined}
                  className={`rounded-md border p-1.5 transition-colors ${
                    currentPage <= 1
                      ? 'pointer-events-none opacity-40'
                      : 'hover:bg-muted'
                  }`}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Link>
                <span className="px-3 text-sm">
                  {currentPage} / {totalPages}
                </span>
                <Link
                  href={buildUrl(currentPage + 1, currentFilter)}
                  aria-label="次のページ"
                  aria-disabled={currentPage >= totalPages}
                  tabIndex={currentPage >= totalPages ? -1 : undefined}
                  className={`rounded-md border p-1.5 transition-colors ${
                    currentPage >= totalPages
                      ? 'pointer-events-none opacity-40'
                      : 'hover:bg-muted'
                  }`}
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
