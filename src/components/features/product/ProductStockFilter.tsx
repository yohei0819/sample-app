'use client'
// 追加 (#104): 在庫切れ非表示トグル（Client Component）
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'

export const ProductStockFilter = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isInStockOnly = searchParams.get('inStockOnly') === '1'

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const params = new URLSearchParams(searchParams.toString())
      if (e.target.checked) {
        params.set('inStockOnly', '1')
      } else {
        params.delete('inStockOnly')
      }
      params.delete('skip')
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams],
  )

  return (
    <label className="flex items-center gap-2 text-sm text-gray-700">
      <input
        type="checkbox"
        checked={isInStockOnly}
        onChange={handleChange}
        className="h-4 w-4 rounded border-gray-300"
        aria-label="在庫切れを除外"
      />
      在庫切れを除外
    </label>
  )
}
