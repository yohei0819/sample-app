// 追加 (#103): 最近見た商品セクション（Client Component）
// localStorage から履歴を読み出して表示する。現在の商品は除外する。
'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRecentlyViewedStore, type RecentlyViewedItem } from '@/stores/recentlyViewedStore'

type Props = {
  // 現在表示している商品。表示時点で履歴に追加する。
  currentProduct: RecentlyViewedItem
}

export const RecentlyViewedProducts = ({ currentProduct }: Props) => {
  const items = useRecentlyViewedStore((s) => s.items)
  const add = useRecentlyViewedStore((s) => s.add)

  // 詳細ページを開いたタイミングで履歴に積む
  useEffect(() => {
    add(currentProduct)
  }, [add, currentProduct])

  // 現在の商品は除外
  const filtered = items.filter((i) => i.id !== currentProduct.id)
  if (filtered.length === 0) return null

  return (
    <section aria-labelledby="recently-viewed-heading" className="space-y-4">
      <h2 id="recently-viewed-heading" className="text-xl font-bold">
        最近見た商品
      </h2>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {filtered.map((item) => (
          <li key={item.id}>
            <Link
              href={`/products/${item.id}`}
              className="group block overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md"
              aria-label={`${item.name}の詳細を見る`}
            >
              <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 20vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400">
                    <span className="text-xs">画像なし</span>
                  </div>
                )}
              </div>
              <div className="p-2">
                <p className="line-clamp-2 text-sm">{item.name}</p>
                <p className="mt-1 text-sm font-bold">¥{item.price.toLocaleString()}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
