'use client'
// カテゴリフィルターコンポーネント（Client Component）
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import type { Category } from '@/generated/prisma/client'

type Props = {
  categories: Category[]
}

export const ProductFilter = ({ categories }: Props) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentCategoryId = searchParams.get('categoryId') ?? ''

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const params = new URLSearchParams(searchParams.toString())
      if (e.target.value) {
        params.set('categoryId', e.target.value)
      } else {
        params.delete('categoryId')
      }
      params.delete('skip')
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams],
  )

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="category" className="text-sm text-gray-600">
        カテゴリ：
      </label>
      <select
        id="category"
        value={currentCategoryId}
        onChange={handleChange}
        className="rounded-md border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
        aria-label="カテゴリで絞り込み"
      >
        <option value="">すべて</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
    </div>
  )
}
