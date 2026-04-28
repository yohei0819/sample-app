// SEO関連の定数
export const SITE_NAME = 'SampleShop'
export const SITE_DESCRIPTION = '上質なアイテムをお届けするオンラインショップ'
export const SITE_LOCALE = 'ja_JP'
export const DEFAULT_OG_IMAGE = '/og-default.png' // public配下のデフォルトOG画像（未配置でも参照のみで問題なし）
export const TWITTER_CARD_TYPE = 'summary_large_image' as const
export const ORGANIZATION_NAME = SITE_NAME

// sitemap用：sitemapに含める静的パス
export const STATIC_SITEMAP_PATHS = [
  '/',
  '/products',
  '/login',
  '/register',
  '/wishlist',
] as const

// robots.ts でクロール禁止とするパス
export const DISALLOWED_PATHS = [
  '/admin/',
  '/api/',
  '/checkout/',
  '/account/',
  '/orders/',
  '/cart/',
] as const

// sitemap優先度・更新頻度
export const SITEMAP_CHANGE_FREQ = {
  HOME: 'daily',
  PRODUCTS_LIST: 'daily',
  PRODUCT_DETAIL: 'weekly',
  STATIC: 'monthly',
} as const

export const SITEMAP_PRIORITY = {
  HOME: 1.0,
  PRODUCTS_LIST: 0.9,
  PRODUCT_DETAIL: 0.8,
  STATIC: 0.5,
} as const
