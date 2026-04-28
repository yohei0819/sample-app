// robots.txt 生成（Next.js App Router 規約）
// 注意: Next.js の規約上 robots.ts は default export が必須のため例外的に export default を使用
import type { MetadataRoute } from 'next'
import { env } from '@/env'
import { DISALLOWED_PATHS } from '@/constants/seo'

const robots = (): MetadataRoute.Robots => {
  const baseUrl = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [...DISALLOWED_PATHS],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}

// Next.js規約上 default export が必須のため例外的に使用
export default robots
