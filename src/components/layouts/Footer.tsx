// ストアフロント用フッター（Server Component）
import Link from 'next/link'

export const Footer = () => {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          {/* コピーライト */}
          <p className="text-sm text-muted-foreground">
            © 2024 SampleShop
          </p>

          {/* リンク群 */}
          <nav
            className="flex flex-wrap justify-center gap-4 sm:justify-end"
            aria-label="フッターナビゲーション"
          >
            <Link
              href="/terms"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              利用規約
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              プライバシーポリシー
            </Link>
            <Link
              href="/contact"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              お問い合わせ
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
