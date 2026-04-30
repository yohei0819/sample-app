// 追加 (#131): 商品バリエーション DB 操作
import 'server-only'
import type { Prisma } from '@/generated/prisma/client'
import { prisma } from '@/lib/db/prisma'

// 商品 ID で variant を取得
export const findVariantsByProductId = async (productId: string) => {
  return prisma.productVariant.findMany({
    where: { productId },
    orderBy: { createdAt: 'asc' },
  })
}

// variant 1 件取得
export const findVariantById = async (id: string) => {
  return prisma.productVariant.findUnique({ where: { id } })
}

// SKU で variant 取得（重複チェック用）
export const findVariantBySku = async (sku: string) => {
  return prisma.productVariant.findUnique({ where: { sku } })
}

// variant 作成
export const createVariant = async (data: {
  productId: string
  sku: string
  attributes: Prisma.InputJsonValue
  priceDelta: number
  stock: number
}) => {
  return prisma.productVariant.create({
    data: {
      product: { connect: { id: data.productId } },
      sku: data.sku,
      attributes: data.attributes,
      priceDelta: data.priceDelta,
      stock: data.stock,
    },
  })
}

// variant 更新
export const updateVariant = async (
  id: string,
  data: {
    sku?: string
    attributes?: Prisma.InputJsonValue
    priceDelta?: number
    stock?: number
  },
) => {
  const update: Prisma.ProductVariantUpdateInput = {}
  if (data.sku !== undefined) update.sku = data.sku
  if (data.attributes !== undefined) update.attributes = data.attributes
  if (data.priceDelta !== undefined) update.priceDelta = data.priceDelta
  if (data.stock !== undefined) update.stock = data.stock
  return prisma.productVariant.update({ where: { id }, data: update })
}

// variant 削除
export const deleteVariant = async (id: string) => {
  return prisma.productVariant.delete({ where: { id } })
}

// variant の在庫をアトミックに減らす（注文確定時）
export const decrementVariantStock = async (
  id: string,
  quantity: number,
): Promise<void> => {
  const result = await prisma.productVariant.updateMany({
    where: { id, stock: { gte: quantity } },
    data: { stock: { decrement: quantity } },
  })
  if (result.count === 0) {
    throw new Error('バリエーションの在庫が不足しています')
  }
}
