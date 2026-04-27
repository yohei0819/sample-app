'use client'
// キーワード検索コンポーネント（Client Component）
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useState, useEffect } from 'react' // 変更: controlled input用フックを追加

export const ProductSearch = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // 変更: controlled inputのローカル状態（URLと常に同期）
  const [inputValue, setInputValue] = useState(searchParams.get('search') ?? '')

  // 変更: 戻るボタン操作など、URLが外部から変化した場合に表示値を同期する
  useEffect(() => {
    setInputValue(searchParams.get('search') ?? '')
  }, [searchParams])

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const params = new URLSearchParams(searchParams.toString())
      if (inputValue) {
        params.set('search', inputValue)
      } else {
        params.delete('search')
      }
      params.delete('skip') // 検索時はページをリセット
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams, inputValue],
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
        value={inputValue}  // 変更: controlled inputに変更してURLとの乖離を防ぐ
        onChange={(e) => setInputValue(e.target.value)}
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
