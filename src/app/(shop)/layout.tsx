// ストアフロント用レイアウト
import type { ReactNode } from 'react'
import { Header } from '@/components/layouts/Header'
import { Footer } from '@/components/layouts/Footer'
// metadataはルートの app/layout.tsx で一元管理

type Props = {
  children: ReactNode
}

export default function ShopLayout({ children }: Props) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
