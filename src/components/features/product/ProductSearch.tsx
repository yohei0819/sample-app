'use client'
// キーワード検索コンポーネント（Client Component）
// 変更 (#104): 検索サジェスト（debounce 300ms）対応
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { SEARCH_SUGGEST_DEBOUNCE_MS, SEARCH_SUGGEST_MIN_QUERY_LENGTH } from '@/constants/search'

type Suggestion = { id: string; name: string }

export const ProductSearch = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [inputValue, setInputValue] = useState(searchParams.get('search') ?? '')
  // 追加 (#104): サジェスト関連状態
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // URL 変化時に input 値を同期
  useEffect(() => {
    setInputValue(searchParams.get('search') ?? '')
  }, [searchParams])

  // 追加 (#104): debounce 経由でサジェスト取得
  useEffect(() => {
    const trimmed = inputValue.trim()
    if (trimmed.length < SEARCH_SUGGEST_MIN_QUERY_LENGTH) {
      setSuggestions([])
      return
    }
    const ctrl = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/products/search-suggest?q=${encodeURIComponent(trimmed)}`,
          { signal: ctrl.signal },
        )
        if (!res.ok) return
        const data = (await res.json()) as { suggestions: Suggestion[] }
        setSuggestions(data.suggestions ?? [])
      } catch {
        // ネットワークエラー時はサジェストを空にしてフォーム送信に委ねる
      }
    }, SEARCH_SUGGEST_DEBOUNCE_MS)

    return () => {
      ctrl.abort()
      clearTimeout(timer)
    }
  }, [inputValue])

  // 追加 (#104): 外側クリックでドロップダウンを閉じる
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  const submitSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set('search', value)
      } else {
        params.delete('search')
      }
      params.delete('skip')
      setIsOpen(false)
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams],
  )

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      submitSearch(inputValue)
    },
    [submitSearch, inputValue],
  )

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} role="search" className="flex w-full gap-2">
        <label htmlFor="search" className="sr-only">
          商品を検索
        </label>
        <input
          id="search"
          name="search"
          type="search"
          autoComplete="off"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="商品を検索..."
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
          aria-label="商品を検索"
          aria-autocomplete="list"
          aria-expanded={isOpen && suggestions.length > 0}
          aria-controls="search-suggestions"
        />
        <button
          type="submit"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
        >
          検索
        </button>
      </form>

      {/* 追加 (#104): サジェストドロップダウン */}
      {isOpen && suggestions.length > 0 && (
        <ul
          id="search-suggestions"
          role="listbox"
          className="absolute z-10 mt-1 max-h-72 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg"
        >
          {suggestions.map((s) => (
            <li key={s.id} role="option" aria-selected="false">
              <button
                type="button"
                onClick={() => {
                  setInputValue(s.name)
                  submitSearch(s.name)
                }}
                className="block w-full cursor-pointer px-3 py-2 text-left text-sm hover:bg-gray-100"
              >
                {s.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
