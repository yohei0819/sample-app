"use client"

// ストアフロント用ヘッダー（Client Component）
import { useState } from 'react'
import Link from 'next/link'
import { ShoppingBag, ShoppingCart, Menu, X } from 'lucide-react'

export const Header = () => {
  // モバイルメニューの開閉状態
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
            aria-label="カートを見る"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <ShoppingCart size={24} />
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            ログイン
          </Link>
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
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              ログイン
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
