'use client'

// ウィッシュリスト追加・削除ボタン（Client Component）
import { useState, useCallback } from 'react'
import { Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Props = {
  productId: string
  // 初期状態（Server Component側でDBから取得した値を渡す）
  initialIsWishlisted: boolean
  // ログイン済みかどうか（falseの場合はログインページへ誘導）
  isLoggedIn: boolean
}

export const WishlistButton = ({ productId, initialIsWishlisted, isLoggedIn }: Props) => {
  const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleClick = useCallback(
    async (e: React.MouseEvent) => {
      // 親要素（商品カードのLink）へのバブルアップを阻止
      e.preventDefault()
      e.stopPropagation()

      if (!isLoggedIn) {
        router.push('/login')
        return
      }

      setIsLoading(true)
      try {
        if (isWishlisted) {
          // 削除
          const res = await fetch(`/api/wishlist/${productId}`, { method: 'DELETE' })
          if (!res.ok) {
            throw new Error('削除に失敗しました')
          }
          setIsWishlisted(false)
        } else {
          // 追加
          const res = await fetch('/api/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId }),
          })
          if (!res.ok && res.status !== 409) {
            throw new Error('追加に失敗しました')
          }
          setIsWishlisted(true)
        }
        // Server Component のキャッシュを再検証
        router.refresh()
      } catch (err) {
        console.error('[WishlistButton] エラー:', err)
        // 変更: API失敗時はUIは変更されず、ユーザーにフィードバックを表示する
        window.alert(
          isWishlisted
            ? 'ウィッシュリストからの削除に失敗しました。しばらくしてから再度お試しください。'
            : 'ウィッシュリストへの追加に失敗しました。しばらくしてから再度お試しください。',
        )
      } finally {
        setIsLoading(false)
      }
    },
    [isWishlisted, isLoggedIn, productId, router],
  )

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      aria-label={isWishlisted ? 'ウィッシュリストから削除する' : 'ウィッシュリストに追加する'}
      aria-pressed={isWishlisted}
      className={[
        'flex items-center justify-center rounded-full p-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-pink-500',
        'disabled:cursor-not-allowed disabled:opacity-50',
        isWishlisted
          ? 'bg-pink-50 text-pink-500 hover:bg-pink-100'
          : 'bg-white/80 text-gray-400 hover:bg-white hover:text-pink-400',
      ].join(' ')}
    >
      <Heart
        size={20}
        className={isWishlisted ? 'fill-pink-500 stroke-pink-500' : 'stroke-current'}
      />
    </button>
  )
}
