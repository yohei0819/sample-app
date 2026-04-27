// ストアフロント用レイアウト
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Header } from '@/components/layouts/Header'
import { Footer } from '@/components/layouts/Footer'

// ルートレイアウトのtitle templateを引き継ぐ
export const metadata: Metadata = {
  title: {
    default: 'SampleShop',
    template: '%s | SampleShop',
  },
  description: '上質なアイテムをお届けするオンラインショップ',
}

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
