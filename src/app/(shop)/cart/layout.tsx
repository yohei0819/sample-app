// 追加: カートページ用レイアウト（metadataを提供するためClient Componentから分離）
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'カート | SampleShop',
  description: 'カートに追加した商品を確認・編集できます。',
  robots: { index: false, follow: false },
}

type Props = {
  children: ReactNode
}

export default function CartLayout({ children }: Props) {
  return children
}
