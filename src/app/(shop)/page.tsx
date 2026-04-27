// ストアフロント トップページ
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SampleShop',
  description: '上質なアイテムをお届けするオンラインショップ',
}

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <section className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">SampleShop</h1>
        <p className="mt-4 text-lg text-gray-600">上質なアイテムをお届けするオンラインショップ</p>
        <div className="mt-8">
          <Link
            href="/products"
            className="inline-block rounded-md bg-gray-900 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-700"
          >
            商品を見る
          </Link>
        </div>
      </section>
    </div>
  )
}
