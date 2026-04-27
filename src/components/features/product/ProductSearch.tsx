'use client'
// キーワード検索コンポーネント（Client Component）
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'

export const ProductSearch = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const form = e.currentTarget
      const input = form.elements.namedItem('search') as HTMLInputElement
      const params = new URLSearchParams(searchParams.toString())
      if (input.value) {
        params.set('search', input.value)
      } else {
        params.delete('search')
      }
      params.delete('skip') // 検索時はページをリセット
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams],
  )

  return (
    <form onSubmit={handleSubmit} role="search" className="flex w-full gap-2">
      <label htmlFor="search" className="sr-only">
        商品を検索
      </label>
      <input
        id="search"
        name="search"
        type="search"
        defaultValue={searchParams.get('search') ?? ''}
        placeholder="商品を検索..."
        className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
        aria-label="商品を検索"
      />
      <button
        type="submit"
        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
      >
        検索
      </button>
    </form>
  )
}
