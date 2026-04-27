"use client"

// ストアフロント用ヘッダー（Client Component）
import { ShoppingBag, ShoppingCart, Menu, X, LogOut, User } from 'lucide-react'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react' // 追加: セッション管理
import { useEffect, useState } from 'react' // 変更: useEffect を追加
import { useCartStore } from '@/stores/cartStore'

export const Header = () => {
  // モバイルメニューの開閉状態
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  // 変更: SSRハイドレーション不一致防止のためマウント後にバッジを表示する
  const [mounted, setMounted] = useState(false)
  // カート合計個数
  const cartCount = useCartStore((state) => state.totalItems())
  // 追加: セッション情報取得
  const { data: session } = useSession()

  useEffect(() => {
    useCartStore.persist.rehydrate() // 追加: 他ページでもlocalStorageからカート状態を復元する
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ロゴ */}
        <Link
          href="/"
          className="flex items-center gap-2"
          aria-label="SampleShop ホームへ"
        >
          <ShoppingBag size={24} className="text-primary" />
          <span className="text-xl font-bold tracking-tight">SampleShop</span>
        </Link>

        {/* デスクトップナビゲーション */}
        <nav
          className="hidden items-center gap-6 md:flex"
          aria-label="メインナビゲーション"
        >
          <Link
            href="/products"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            商品一覧
          </Link>
          <Link
            href="/wishlist"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            ウィッシュリスト
          </Link>
        </nav>

        {/* デスクトップアクション */}
        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/cart"
            aria-label={`カートを見る${cartCount > 0 ? `（${cartCount}点）` : ''}`}
            className="relative text-muted-foreground transition-colors hover:text-foreground"
          >
            <ShoppingCart size={24} />
            {/* 変更: カートバッジ（mountedかつ在庫ありのみ表示） */}
            {mounted && cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>
          {/* 追加: セッション状態に応じてログイン/ユーザー情報を切り替え */}
          {session ? (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <User size={16} aria-hidden="true" />
                {session.user?.name ?? session.user?.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                aria-label="ログアウト"
              >
                <LogOut size={16} aria-hidden="true" />
                ログアウト
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                ログイン
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                会員登録
              </Link>
            </div>
          )}
        </div>

        {/* モバイルメニューボタン */}
        <button
          className="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'メニューを閉じる' : 'メニューを開く'}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* モバイルメニュー */}
      {isMenuOpen && (
        <div className="border-t bg-background md:hidden">
          <nav
            className="flex flex-col gap-4 px-4 py-4"
            aria-label="モバイルナビゲーション"
          >
            <Link
              href="/products"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              商品一覧
            </Link>
            <Link
              href="/wishlist"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              ウィッシュリスト
            </Link>
            <Link
              href="/cart"
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              <ShoppingCart size={20} />
              カート
            </Link>
            {/* 追加: モバイル用ログイン/ユーザーメニュー */}
            {session ? (
              <>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <User size={16} aria-hidden="true" />
                  {session.user?.name ?? session.user?.email}
                </span>
                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    signOut({ callbackUrl: '/' })
                  }}
                  className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="ログアウト"
                >
                  <LogOut size={16} aria-hidden="true" />
                  ログアウト
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setIsMenuOpen(false)}
                >
                  ログイン
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setIsMenuOpen(false)}
                >
                  会員登録
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
