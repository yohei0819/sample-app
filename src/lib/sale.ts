// 追加 (#107): タイムセール価格適用ヘルパー
import type { Sale } from '@/generated/prisma/client'

type ProductLike = { id: string; price: number }

// 適用中のセールがあれば salePrice を、なければ通常価格を返す
export const getEffectivePrice = (
  product: ProductLike,
  sale: Sale | null | undefined,
  now: Date = new Date(),
): number => {
  if (!sale) return product.price
  if (!sale.isActive) return product.price
  if (sale.startsAt > now) return product.price
  if (sale.endsAt <= now) return product.price
  if (sale.salePrice >= product.price) return product.price
  return sale.salePrice
}

// セールが現在適用中か
export const isSaleActive = (sale: Sale | null | undefined, now: Date = new Date()): boolean => {
  if (!sale) return false
  return sale.isActive && sale.startsAt <= now && sale.endsAt > now
}

// 割引率（%）。セール非適用なら 0
export const getDiscountPercent = (
  product: ProductLike,
  sale: Sale | null | undefined,
  now: Date = new Date(),
): number => {
  const effective = getEffectivePrice(product, sale, now)
  if (effective >= product.price || product.price === 0) return 0
  return Math.round(((product.price - effective) / product.price) * 100)
}
