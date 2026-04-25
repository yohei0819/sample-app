import { prisma } from '@/lib/db/prisma'
import type { OrderStatus, Prisma } from '@/generated/prisma/client'

// 注文一覧取得（管理画面用）
export const findOrders = async (params: {
  status?: OrderStatus
  take?: number
  skip?: number
}) => {
  const { status, take = 20, skip = 0 } = params
  return prisma.order.findMany({
    where: { ...(status ? { status } : {}) },
    include: { user: true, items: { include: { product: true } } },
    take,
    skip,
    orderBy: { createdAt: 'desc' },
  })
}

// ユーザーの注文一覧取得
export const findOrdersByUserId = async (userId: string) => {
  return prisma.order.findMany({
    where: { userId },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  })
}

// 注文1件取得
export const findOrderById = async (id: string) => {
  return prisma.order.findUnique({
    where: { id },
    include: { user: true, items: { include: { product: true } }, coupon: true },
  })
}

// 注文作成
export const createOrder = async (data: Prisma.OrderCreateInput) => {
  return prisma.order.create({ data, include: { items: true } })
}

// 注文ステータス更新
export const updateOrderStatus = async (id: string, status: OrderStatus) => {
  return prisma.order.update({ where: { id }, data: { status } })
}
