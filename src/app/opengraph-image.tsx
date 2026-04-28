// 追加: トップページの動的 OGP 画像
// Next.js App Router の opengraph-image 規約で生成される
import { ImageResponse } from 'next/og'
import { SITE_NAME, SITE_DESCRIPTION } from '@/constants/seo'

export const runtime = 'edge'
export const alt = SITE_NAME
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const Image = () =>
  new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #404040 100%)',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: -2 }}>{SITE_NAME}</div>
        <div style={{ marginTop: 24, fontSize: 32, color: '#cccccc' }}>{SITE_DESCRIPTION}</div>
      </div>
    ),
    { ...size },
  )

export default Image
