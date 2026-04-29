// 追加 (#106): 在庫変動履歴のリポジトリ関数
import { prisma } from '@/lib/db/prisma'
import type { Prisma, StockMovementType } from '@/generated/prisma/client'

// 在庫変動履歴を作成
export const createStockMovement = async (data: {
  productId: string
  type: StockMovementType
  quantity: number
  reason?: string | null
  userId?: string | null
  tx?: Prisma.TransactionClient
}) => {
  const { tx, ...rest } = data
  const client = tx ?? prisma
  return client.stockMovement.create({ data: rest })
}

// 商品の在庫変動履歴を新しい順に取得
export const findStockMovementsByProductId = async (params: {
  productId: string
  take?: number
  skip?: number
}) => {
  const { productId, take = 50, skip = 0 } = params
  return prisma.stockMovement.findMany({
    where: { productId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
    take,
    skip,
  })
}

// 在庫不足商品を取得（stock <= lowStockThreshold）
export const findLowStockProducts = async (params: { take?: number } = {}) => {
  const { take = 20 } = params
  // Prisma の column-to-column 比較は raw を使うか field reference 構文
  return prisma.$queryRaw<
    Array<{
      id: string
      name: string
      stock: number
      lowStockThreshold: number
    }>
  >`
    SELECT id, name, stock, "lowStockThreshold"
    FROM products
    WHERE "isPublished" = true AND stock <= "lowStockThreshold"
    ORDER BY stock ASC
    LIMIT ${take}
  `
}
