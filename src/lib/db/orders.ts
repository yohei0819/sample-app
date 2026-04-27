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
    include: { user: { select: { id: true, email: true, name: true } }, items: { include: { product: true } } }, // 変更: passwordHash 露出防止
    take,
    skip,
    orderBy: { createdAt: 'desc' },
  })
}

// ユーザーの注文一覧取得
export const findOrdersByUserId = async (userId: string, params: { take?: number; skip?: number } = {}) => {
  const { take, skip } = params
  return prisma.order.findMany({
    where: { userId },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
    ...(take !== undefined ? { take } : {}),
    ...(skip !== undefined ? { skip } : {}),
  })
}

// 注文1件取得
export const findOrderById = async (id: string) => {
  return prisma.order.findUnique({
    where: { id },
    include: { user: { select: { id: true, email: true, name: true } }, items: { include: { product: true } }, coupon: true }, // 変更: passwordHash 露出防止
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

// 追加: PaymentIntent ID を注文に紐付ける
export const updateOrderStripeId = async (id: string, stripePaymentIntentId: string) => {
  return prisma.order.update({ where: { id }, data: { stripePaymentIntentId } })
}

// 追加: PaymentIntent ID で注文を検索して PAID に更新
export const updateOrderToPaidByStripeId = async (stripePaymentIntentId: string) => {
  return prisma.order.updateMany({
    where: { stripePaymentIntentId },
    data: { status: 'PAID' },
  })
}
