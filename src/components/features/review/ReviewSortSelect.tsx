'use client'
// 追加 (#132): レビュー並び替えセレクター
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { REVIEW_SORT_ORDERS, type ReviewSortOrder } from '@/constants/reviews'

type Props = {
  current: ReviewSortOrder
}

const LABELS: Record<ReviewSortOrder, string> = {
  newest: '新しい順',
  helpful: '役に立った順',
}

export const ReviewSortSelect = ({ current }: Props) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as ReviewSortOrder
    const params = new URLSearchParams(searchParams.toString())
    params.set('reviewSort', next)
    router.replace(`${pathname}?${params.toString()}#reviews-heading`, { scroll: false })
  }

  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">並び替え</span>
      <select
        value={current}
        onChange={handleChange}
        aria-label="レビューの並び替え"
        className="rounded-md border border-input bg-background px-2 py-1 text-sm"
      >
        {REVIEW_SORT_ORDERS.map((s) => (
          <option key={s} value={s}>
            {LABELS[s]}
          </option>
        ))}
      </select>
    </label>
  )
}
