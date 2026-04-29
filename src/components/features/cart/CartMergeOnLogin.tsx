'use client'
// ログイン時にローカルカートをサーバーへマージするだけのコンポーネント（#119）
import { useCartMergeOnLogin } from '@/hooks/useCartMergeOnLogin'

export const CartMergeOnLogin = () => {
  useCartMergeOnLogin()
  return null
}
