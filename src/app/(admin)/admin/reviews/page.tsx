// 管理画面 レビュー一覧ページ（Server Component）
import { Suspense } from 'react'
import { countAllReviews, findAllReviewsForAdmin } from '@/lib/db/reviews'
import { AdminReviewTable } from '@/components/features/admin/AdminReviewTable'
import { ADMIN_REVIEW_PAGE_SIZE } from '@/constants/admin'

export const metadata = {
  title: 'レビュー管理 | 管理画面',
}

type SearchParams = {
  isPublic?: string
  page?: string
}

type Props = {
  searchParams: Promise<SearchParams>
}

export default async function AdminReviewsPage({ searchParams }: Props) {
  const { isPublic: isPublicParam, page: pageParam } = await searchParams

  const isPublic =
    isPublicParam === 'true' ? true : isPublicParam === 'false' ? false : undefined

  const page = Math.max(1, Number(pageParam ?? 1))
  const skip = (page - 1) * ADMIN_REVIEW_PAGE_SIZE

  const [reviews, total] = await Promise.all([
    findAllReviewsForAdmin({ isPublic, take: ADMIN_REVIEW_PAGE_SIZE, skip }),
    countAllReviews({ isPublic }),
  ])

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">レビュー管理</h1>
        <p className="text-sm text-muted-foreground">レビューの公開/非公開切替・削除</p>
      </div>

      <Suspense fallback={<p className="text-sm text-muted-foreground">読み込み中...</p>}>
        <AdminReviewTable
          reviews={reviews}
          total={total}
          currentPage={page}
          currentFilter={isPublicParam ?? ''}
        />
      </Suspense>
    </div>
  )
}
