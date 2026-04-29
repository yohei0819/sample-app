// 追加: 商品詳細ページの動的 OGP 画像
// 商品名と価格を中心に表示する。商品画像は edge runtime + 外部URL の制約で省略。
import { ImageResponse } from 'next/og'
import { findProductById } from '@/lib/db/products'
import { SITE_NAME } from '@/constants/seo'

// edge runtime は Prisma が動かないため Node.js runtime を使用
export const runtime = 'nodejs'
export const alt = '商品ページ'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

type Props = {
  // 変更: Next.js 15 の非同期 params
  params: Promise<{ id: string }>
}

const Image = async ({ params }: Props) => {
  const { id } = await params // 変更
  const product = await findProductById(id)

  const name = product?.name ?? '商品'
  const price = product ? `¥${product.price.toLocaleString()}` : ''

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ffffff',
          color: '#1a1a1a',
          fontFamily: 'sans-serif',
          padding: 80,
        }}
      >
        <div style={{ fontSize: 28, color: '#666666', marginBottom: 32 }}>{SITE_NAME}</div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            textAlign: 'center',
            lineHeight: 1.2,
            letterSpacing: -1,
          }}
        >
          {name}
        </div>
        {price && (
          <div style={{ marginTop: 48, fontSize: 56, fontWeight: 600, color: '#1a1a1a' }}>
            {price}
          </div>
        )}
      </div>
    ),
    { ...size },
  )
}

export default Image
