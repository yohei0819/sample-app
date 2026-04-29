'use client'
// ログイン時にローカル（Zustand）カートをサーバーカートにマージするフック（#119）
import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useCartStore } from '@/stores/cartStore'

// ログイン直後に1回だけ実行する
export const useCartMergeOnLogin = () => {
  const { data: session, status } = useSession()
  const items = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clearCart)
  // ユーザーIDごとに重複実行を防ぐ
  const mergedForUser = useRef<string | null>(null)

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.id) return
    if (mergedForUser.current === session.user.id) return

    const localItems = items.map((i) => ({ productId: i.id, quantity: i.quantity }))
    mergedForUser.current = session.user.id

    // ローカルが空ならマージ不要、サーバー取得もスキップしておく（不要な API 呼び出し防止）
    if (localItems.length === 0) return

    const run = async () => {
      try {
        const res = await fetch('/api/cart', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: localItems }),
        })
        if (res.ok) {
          // マージ成功後、ローカルカートをクリア（以後はサーバーが正）
          clearCart()
        }
      } catch {
        // ネットワークエラー時は次回ログインで再試行
        mergedForUser.current = null
      }
    }
    run()
  }, [status, session?.user?.id, items, clearCart])
}
