import { prisma } from '@/lib/db/prisma'
import type { Product, Prisma } from '@/generated/prisma/client'

// 商品一覧取得（フィルター・ページネーション付き）
// 変更 (#104): 価格レンジ・在庫切れ非表示・人気順ソートに対応
export const findProducts = async (params: {
  categoryId?: string
  search?: string
  take?: number
  skip?: number
  orderBy?: Prisma.ProductOrderByWithRelationInput
  minPrice?: number
  maxPrice?: number
  inStockOnly?: boolean
}) => {
  const {
    categoryId,
    search,
    take = 20,
    skip = 0,
    orderBy = { createdAt: 'desc' },
    minPrice,
    maxPrice,
    inStockOnly,
  } = params

  // 追加 (#104): 価格レンジ条件を構築
  const priceFilter: Prisma.IntFilter = {}
  if (typeof minPrice === 'number') priceFilter.gte = minPrice
  if (typeof maxPrice === 'number') priceFilter.lte = maxPrice
  const hasPriceFilter = Object.keys(priceFilter).length > 0

  return prisma.product.findMany({
    where: {
      isPublished: true,
      ...(categoryId ? { categoryId } : {}),
      ...(hasPriceFilter ? { price: priceFilter } : {}),
      ...(inStockOnly ? { stock: { gt: 0 } } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: { category: true },
    take,
    skip,
    orderBy,
  })
}

// 追加 (#104): 検索サジェスト用（商品名 prefix 一致・公開済み）
export const findProductSuggestions = async (params: {
  query: string
  limit?: number
}) => {
  const { query, limit = 8 } = params
  return prisma.product.findMany({
    where: {
      isPublished: true,
      name: { contains: query, mode: 'insensitive' },
    },
    select: { id: true, name: true },
    take: limit,
    orderBy: { name: 'asc' },
  })
}

// 商品1件取得（非公開商品は取得しない）
export const findProductById = async (id: string) => {
  return prisma.product.findFirst({
    where: { id, isPublished: true }, // 変更: 非公開商品を除外
    include: {
      category: true,
      variants: { orderBy: { createdAt: 'asc' } }, // 追加 (#131): バリエーション一覧
    },
  })
}

// 商品作成（管理画面用）
export const createProduct = async (data: Prisma.ProductCreateInput) => {
  return prisma.product.create({ data })
}

// 商品更新（管理画面用）
// 変更 (#106): 在庫が変動した場合は StockMovement(ADJUST) を同一トランザクションで記録
export const updateProduct = async (
  id: string,
  data: Prisma.ProductUpdateInput,
  options?: { userId?: string | null },
) => {
  return prisma.$transaction(async (tx) => {
    const before = await tx.product.findUnique({ where: { id }, select: { stock: true } })
    const updated = await tx.product.update({ where: { id }, data })
    if (before && before.stock !== updated.stock) {
      const diff = updated.stock - before.stock
      await tx.stockMovement.create({
        data: {
          productId: id,
          type: 'ADJUST',
          quantity: diff,
          reason: '管理画面からの在庫調整',
          userId: options?.userId ?? null,
        },
      })
    }
    return updated
  })
}

// 商品削除（管理画面用）
export const deleteProduct = async (id: string): Promise<Product> => {
  return prisma.product.delete({ where: { id } })
}

// 在庫を減らす（注文確定時） - アトミックな updateMany でTOCTOU競合を防ぐ
// 変更 (#106): 在庫減少を StockMovement(OUT) として履歴に残す
// 変更 (#131): variantId 指定時は variant 単位で在庫を減らす（Product.stock は変更しない）
export const decrementStock = async (
  id: string,
  quantity: number,
  options?: { reason?: string; userId?: string | null; variantId?: string | null },
): Promise<void> => {
  const variantId = options?.variantId ?? null

  await prisma.$transaction(async (tx) => {
    if (variantId) {
      // バリエーション在庫を減算（Product.stock は変更しない）
      const variantResult = await tx.productVariant.updateMany({
        where: { id: variantId, productId: id, stock: { gte: quantity } },
        data: { stock: { decrement: quantity } },
      })
      if (variantResult.count === 0) {
        throw new Error('バリエーションの在庫が不足しています')
      }
      // 在庫変動履歴は商品単位で記録（reason に variantId を含める）
      await tx.stockMovement.create({
        data: {
          productId: id,
          type: 'OUT',
          quantity: -quantity,
          reason: `${options?.reason ?? '注文による出庫'}（variant: ${variantId}）`,
          userId: options?.userId ?? null,
        },
      })
      return
    }

    const result = await tx.product.updateMany({
      where: { id, stock: { gte: quantity } },
      data: { stock: { decrement: quantity } },
    })
    if (result.count === 0) {
      throw new Error('在庫が不足しています')
    }
    await tx.stockMovement.create({
      data: {
        productId: id,
        type: 'OUT',
        quantity: -quantity,
        reason: options?.reason ?? '注文による出庫',
        userId: options?.userId ?? null,
      },
    })
  })
}

// 追加: 管理画面用商品一覧取得（非公開商品も含む）
export const findAllProductsForAdmin = async (params: {
  search?: string
  take?: number
  skip?: number
} = {}) => {
  const { search, take = 50, skip = 0 } = params
  return prisma.product.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined,
    include: { category: true },
    take,
    skip,
    orderBy: { createdAt: 'desc' },
  })
}

// 追加: 管理画面用商品1件取得（非公開商品も含む）
export const findProductByIdForAdmin = async (id: string) => {
  return prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      variants: { orderBy: { createdAt: 'asc' } }, // 追加 (#131): バリエーション一覧
    },
  })
}

// 追加 (#103): 関連商品取得（同カテゴリ・公開済み・指定商品を除外）
export const findRelatedProducts = async (params: {
  categoryId: string
  excludeId: string
  limit?: number
}) => {
  const { categoryId, excludeId, limit = 8 } = params
  return prisma.product.findMany({
    where: {
      isPublished: true,
      categoryId,
      id: { not: excludeId },
    },
    include: { category: true },
    take: limit,
    orderBy: { createdAt: 'desc' },
  })
}

type CartItemInput = {
  id: string
  quantity: number
  variantId?: string | null // 追加 (#131)
}

// 追加: カートアイテムの商品検証（存在・公開・在庫確認）を共通化
// 変更 (#131): variantId が指定されている場合は variant の在庫・存在を検証する
export const validateCartItems = async (items: CartItemInput[]) => {
  return Promise.all(
    items.map(async ({ id, quantity, variantId }) => {
      const product = await findProductById(id)
      if (!product) throw new Error(`商品が見つかりません: ${id}`)
      if (!product.isPublished) throw new Error(`非公開商品です: ${id}`)

      // バリエーションあり商品の場合、variantId 必須
      const hasVariants = product.variants.length > 0
      if (hasVariants && !variantId) {
        throw new Error(`バリエーションを選択してください: ${product.name}`)
      }

      if (variantId) {
        const variant = product.variants.find((v) => v.id === variantId)
        if (!variant) throw new Error(`バリエーションが見つかりません: ${variantId}`)
        if (variant.stock < quantity) throw new Error(`在庫不足: ${product.name}`)
        return { product, variant, quantity }
      }

      if (product.stock < quantity) throw new Error(`在庫不足: ${product.name}`)
      return { product, variant: null, quantity }
    })
  )
}
