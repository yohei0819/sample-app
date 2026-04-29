// 管理画面用ヘッダー（Server Component）
import Link from 'next/link'
import { LayoutDashboard } from 'lucide-react'

export const AdminHeader = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* 管理画面タイトル */}
        <div className="flex items-center gap-2">
          <LayoutDashboard size={24} className="text-primary" />
          <span className="text-xl font-bold tracking-tight">管理画面</span>
        </div>

        {/* ナビゲーション */}
        <nav
          className="flex flex-wrap items-center gap-3 sm:gap-6"
          aria-label="管理画面ナビゲーション"
        >
          <Link
            href="/admin/dashboard"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            ダッシュボード
          </Link>
          <Link
            href="/admin/products"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            商品管理
          </Link>
          <Link
            href="/admin/orders"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            注文管理
          </Link>
          {/* 追加 */}
          <Link
            href="/admin/categories"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            カテゴリ管理
          </Link>
          {/* 追加 */}
          <Link
            href="/admin/inventory"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            在庫管理
          </Link>
          {/* 追加 */}
          <Link
            href="/admin/coupons"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            クーポン管理
          </Link>
          {/* 追加: ユーザー管理 */}
          <Link
            href="/admin/users"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            ユーザー管理
          </Link>
          {/* 追加: レビュー管理 */}
          <Link
            href="/admin/reviews"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            レビュー管理
          </Link>
          {/* 追加: メールテンプレート管理 */}
          <Link
            href="/admin/email-templates"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            メールテンプレート
          </Link>
          {/* 追加 (#107): タイムセール管理 */}
          <Link
            href="/admin/sales"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            タイムセール
          </Link>
        </nav>
      </div>
    </header>
  )
}
