// 追加 (#107): タイムセールのリポジトリ関数
import { prisma } from '@/lib/db/prisma'
import type { Prisma, Sale } from '@/generated/prisma/client'

// 商品の現在有効なセールを取得
export const findActiveSaleForProduct = async (
  productId: string,
  now: Date = new Date(),
): Promise<Sale | null> => {
  return prisma.sale.findFirst({
    where: {
      productId,
      isActive: true,
      startsAt: { lte: now },
      endsAt: { gt: now },
    },
    orderBy: { salePrice: 'asc' },
  })
}

// 複数商品の有効セールを一括取得（productId -> Sale）
export const findActiveSalesForProducts = async (
  productIds: string[],
  now: Date = new Date(),
): Promise<Map<string, Sale>> => {
  if (productIds.length === 0) return new Map()
  const sales = await prisma.sale.findMany({
    where: {
      productId: { in: productIds },
      isActive: true,
      startsAt: { lte: now },
      endsAt: { gt: now },
    },
    orderBy: { salePrice: 'asc' },
  })
  const map = new Map<string, Sale>()
  for (const s of sales) {
    if (!map.has(s.productId)) map.set(s.productId, s)
  }
  return map
}

// セール一覧（管理画面用）
export const findAllSales = async () => {
  return prisma.sale.findMany({
    include: { product: { select: { id: true, name: true, price: true } } },
    orderBy: { startsAt: 'desc' },
  })
}

export const findSaleById = async (id: string) => {
  return prisma.sale.findUnique({
    where: { id },
    include: { product: { select: { id: true, name: true, price: true } } },
  })
}

export const createSale = async (data: Prisma.SaleUncheckedCreateInput) => {
  return prisma.sale.create({ data })
}

export const updateSale = async (id: string, data: Prisma.SaleUpdateInput) => {
  return prisma.sale.update({ where: { id }, data })
}

export const deleteSale = async (id: string): Promise<Sale> => {
  return prisma.sale.delete({ where: { id } })
}

// 同一商品の期間重複チェック（指定期間に重なる別セールがあるか）
export const findOverlappingSale = async (params: {
  productId: string
  startsAt: Date
  endsAt: Date
  excludeId?: string
}) => {
  const { productId, startsAt, endsAt, excludeId } = params
  return prisma.sale.findFirst({
    where: {
      productId,
      isActive: true,
      ...(excludeId ? { id: { not: excludeId } } : {}),
      // 重なり条件: existing.startsAt < endsAt && existing.endsAt > startsAt
      startsAt: { lt: endsAt },
      endsAt: { gt: startsAt },
    },
  })
}
