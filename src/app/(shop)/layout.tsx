// ストアフロント用レイアウト
import type { ReactNode } from 'react'
import { Header } from '@/components/layouts/Header'
import { Footer } from '@/components/layouts/Footer'
import { EmailVerificationBanner } from '@/components/layouts/EmailVerificationBanner' // 追加 (#120)

type Props = {
  children: ReactNode
}

export default function ShopLayout({ children }: Props) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <EmailVerificationBanner />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
