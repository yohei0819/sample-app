'use client'
// 追加 (#104): 価格レンジ絞り込みフィルター（Client Component）
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { PRICE_RANGE_MAX } from '@/constants/search'

export const ProductPriceFilter = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') ?? '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') ?? '')

  useEffect(() => {
    setMinPrice(searchParams.get('minPrice') ?? '')
    setMaxPrice(searchParams.get('maxPrice') ?? '')
  }, [searchParams])

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const params = new URLSearchParams(searchParams.toString())
      // 入力値をバリデーション（0 以上 PRICE_RANGE_MAX 以下）
      const min = Number(minPrice)
      const max = Number(maxPrice)
      if (minPrice && Number.isFinite(min) && min >= 0 && min <= PRICE_RANGE_MAX) {
        params.set('minPrice', String(Math.floor(min)))
      } else {
        params.delete('minPrice')
      }
      if (maxPrice && Number.isFinite(max) && max >= 0 && max <= PRICE_RANGE_MAX) {
        params.set('maxPrice', String(Math.floor(max)))
      } else {
        params.delete('maxPrice')
      }
      params.delete('skip')
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams, minPrice, maxPrice],
  )

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <label htmlFor="minPrice" className="text-sm text-gray-600">
        価格：
      </label>
      <input
        id="minPrice"
        type="number"
        inputMode="numeric"
        min={0}
        max={PRICE_RANGE_MAX}
        value={minPrice}
        onChange={(e) => setMinPrice(e.target.value)}
        placeholder="下限"
        className="w-24 rounded-md border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
        aria-label="最低価格"
      />
      <span aria-hidden="true" className="text-sm text-gray-500">
        〜
      </span>
      <label htmlFor="maxPrice" className="sr-only">
        最高価格
      </label>
      <input
        id="maxPrice"
        type="number"
        inputMode="numeric"
        min={0}
        max={PRICE_RANGE_MAX}
        value={maxPrice}
        onChange={(e) => setMaxPrice(e.target.value)}
        placeholder="上限"
        className="w-24 rounded-md border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
        aria-label="最高価格"
      />
      <button
        type="submit"
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100"
      >
        適用
      </button>
    </form>
  )
}
