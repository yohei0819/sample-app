import { prisma } from '@/lib/db/prisma'
import type { Product, Prisma } from '@/generated/prisma/client'

// 商品一覧取得（フィルター・ページネーション付き）
export const findProducts = async (params: {
  categoryId?: string
  search?: string
  take?: number
  skip?: number
  orderBy?: Prisma.ProductOrderByWithRelationInput
}) => {
  const { categoryId, search, take = 20, skip = 0, orderBy = { createdAt: 'desc' } } = params
  return prisma.product.findMany({
    where: {
      isPublished: true,
      ...(categoryId ? { categoryId } : {}),
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

// 商品1件取得（非公開商品は取得しない）
export const findProductById = async (id: string) => {
  return prisma.product.findFirst({
    where: { id, isPublished: true }, // 変更: 非公開商品を除外
    include: { category: true }, // 変更: レビュー表示機能が未実装のため reviews の include を除外
  })
}

// 商品作成（管理画面用）
export const createProduct = async (data: Prisma.ProductCreateInput) => {
  return prisma.product.create({ data })
}

// 商品更新（管理画面用）
export const updateProduct = async (id: string, data: Prisma.ProductUpdateInput) => {
  return prisma.product.update({ where: { id }, data })
}

// 商品削除（管理画面用）
export const deleteProduct = async (id: string): Promise<Product> => {
  return prisma.product.delete({ where: { id } })
}

// 在庫を減らす（注文確定時） - アトミックな updateMany でTOCTOU競合を防ぐ
export const decrementStock = async (id: string, quantity: number): Promise<void> => {
  const result = await prisma.product.updateMany({
    where: { id, stock: { gte: quantity } },
    data: { stock: { decrement: quantity } },
  })
  if (result.count === 0) {
    throw new Error('在庫が不足しています') // 変更
  }
}
