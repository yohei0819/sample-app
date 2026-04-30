// 追加 (#131): 商品バリエーション価格計算ヘルパー
// 基本価格 + variant の priceDelta を合算し、Sale が適用される場合は商品単位の effectivePrice を採用する。
import type { Sale } from '@/generated/prisma/client'
import { getEffectivePrice } from '@/lib/sale'

type ProductLike = { id: string; price: number }
type VariantLike = { priceDelta: number } | null | undefined

// バリエーション差分込みの基本単価（円）
// - variant 未指定: product.price を返す
// - variant 指定:   product.price + variant.priceDelta を返す（最低 0 円にクランプ）
export const computeVariantBasePrice = (
  product: ProductLike,
  variant: VariantLike,
): number => {
  const base = product.price + (variant?.priceDelta ?? 0)
  return Math.max(0, base)
}

// 注文 / 表示用の最終単価（円）
// Sale が適用される場合は Sale 価格を優先し、それ以外は variant 差分込みの基本単価を返す。
// 注: 現状の Sale は商品単位のため、variant 単位の Sale は扱わない（後方互換のため変更しない）。
export const computeUnitPrice = (
  product: ProductLike,
  variant: VariantLike,
  sale: Sale | null | undefined,
  now: Date = new Date(),
): number => {
  const saleEffective = getEffectivePrice(product, sale, now)
  // セール適用中（=セール価格 < 通常価格）はセール価格を採用
  if (saleEffective < product.price) {
    return saleEffective
  }
  return computeVariantBasePrice(product, variant)
}
