// サイトマップ生成（Next.js App Router 規約）
// 注意: Next.js の規約上 sitemap.ts は default export が必須のため例外的に export default を使用
import type { MetadataRoute } from 'next'
import { env } from '@/env'
import { prisma } from '@/lib/db/prisma'
import {
  STATIC_SITEMAP_PATHS,
  SITEMAP_CHANGE_FREQ,
  SITEMAP_PRIORITY,
  SITEMAP_MAX_PRODUCTS,
} from '@/constants/seo'

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const baseUrl = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')

  // 静的ページ
  const staticEntries: MetadataRoute.Sitemap = STATIC_SITEMAP_PATHS.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency:
      path === '/'
        ? SITEMAP_CHANGE_FREQ.HOME
        : path === '/products'
          ? SITEMAP_CHANGE_FREQ.PRODUCTS_LIST
          : SITEMAP_CHANGE_FREQ.STATIC,
    priority:
      path === '/'
        ? SITEMAP_PRIORITY.HOME
        : path === '/products'
          ? SITEMAP_PRIORITY.PRODUCTS_LIST
          : SITEMAP_PRIORITY.STATIC,
  }))

  // 公開中の商品詳細ページ（DB直アクセスでパフォーマンス重視）
  // 変更: sitemap が肥大化しないよう take で件数を制限し、新しいものから優先
  const products = await prisma.product.findMany({
    where: { isPublished: true },
    select: { id: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
    take: SITEMAP_MAX_PRODUCTS,
  })

  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${baseUrl}/products/${p.id}`,
    lastModified: p.updatedAt,
    changeFrequency: SITEMAP_CHANGE_FREQ.PRODUCT_DETAIL,
    priority: SITEMAP_PRIORITY.PRODUCT_DETAIL,
  }))

  return [...staticEntries, ...productEntries]
}

// Next.js規約上 default export が必須のため例外的に使用
export default sitemap
