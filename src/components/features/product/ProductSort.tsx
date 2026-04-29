'use client'
// ソート選択コンポーネント（Client Component）
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'

const SORT_OPTIONS = [
  { value: 'newest', label: '新着順' },
  { value: 'price_asc', label: '価格が安い順' },
  { value: 'price_desc', label: '価格が高い順' },
  { value: 'popular', label: '人気順' }, // 追加 (#104)
] as const

export const ProductSort = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get('sort') ?? 'newest'

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('sort', e.target.value)
      params.delete('skip')
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams],
  )

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="text-sm text-gray-600">
        並び替え：
      </label>
      <select
        id="sort"
        value={currentSort}
        onChange={handleChange}
        className="rounded-md border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
        aria-label="並び替え"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
