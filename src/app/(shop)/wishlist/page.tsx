// ウィッシュリスト一覧ページ（Server Component）
import { redirect } from 'next/navigation'
import Link from 'next/link' // 追加
import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { findWishlistByUserId } from '@/lib/db/wishlist'
import { WishlistProductCard } from '@/components/features/wishlist/WishlistProductCard'

export const metadata: Metadata = {
  title: 'ウィッシュリスト',
  description: 'お気に入りに追加した商品の一覧です。',
}

export default async function WishlistPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const wishlist = await findWishlistByUserId(session.user.id)
  const items = wishlist?.items ?? []

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">ウィッシュリスト</h1>

      {items.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-gray-500">ウィッシュリストに商品がありません。</p>
          {/* 変更: <a> → next/link の <Link> に変更 */}
          <Link
            href="/products"
            className="mt-4 inline-block text-sm font-medium text-gray-900 underline underline-offset-4 hover:text-gray-700"
          >
            商品一覧へ
          </Link>
        </div>
      ) : (
        <>
          {/* 件数表示 */}
          <p className="mb-4 text-sm text-gray-500">{items.length}件のお気に入り商品</p>

          {/* 商品グリッド */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {items.map((item) => (
              <WishlistProductCard key={item.id} item={item} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
