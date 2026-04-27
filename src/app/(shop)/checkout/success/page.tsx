// 注文完了ページ（Stripe リダイレクト後）
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

export default function CheckoutSuccessPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-6 text-center">
        <CheckCircle2 size={56} className="text-green-500" aria-hidden="true" />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">ご注文ありがとうございます</h1>
          <p className="text-muted-foreground">
            ご注文を受け付けました。
            <br />
            注文確認メールをお送りしましたのでご確認ください。
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full sm:flex-row sm:justify-center">
          <Link
            href="/orders"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            注文履歴を確認する
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md border px-6 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            ショッピングを続ける
          </Link>
        </div>
      </div>
    </main>
  )
}
