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

// 追加: 楽観ロック付きステータス更新
// 期待する現在ステータスに一致する場合のみ更新し、更新件数（0 or 1）を返す
export const updateOrderStatusIfMatches = async (
  id: string,
  expectedCurrentStatus: OrderStatus,
  newStatus: OrderStatus,
): Promise<number> => {
  // 追加 (#118): SHIPPED/DELIVERED へ遷移する際に shippedAt/deliveredAt を自動設定する
  const data: Prisma.OrderUpdateManyMutationInput = { status: newStatus }
  if (newStatus === 'SHIPPED') {
    data.shippedAt = new Date()
  } else if (newStatus === 'DELIVERED') {
    data.deliveredAt = new Date()
  }
  const result = await prisma.order.updateMany({
    where: { id, status: expectedCurrentStatus },
    data,
  })
  return result.count
}

// 追加 (#118): 配送追跡情報の更新
// trackingNumber が新規に設定された場合、shippedAt も同時にセットする
export const updateOrderShipping = async (
  id: string,
  data: { carrier: string | null; trackingNumber: string | null },
) => {
  const existing = await prisma.order.findUnique({
    where: { id },
    select: { trackingNumber: true, shippedAt: true },
  })
  if (!existing) return null

  const updateData: Prisma.OrderUpdateInput = {
    carrier: data.carrier,
    trackingNumber: data.trackingNumber,
  }
  // 追跡番号が新規に入力された場合は発送日時を自動設定
  if (data.trackingNumber && !existing.shippedAt) {
    updateData.shippedAt = new Date()
  }
  return prisma.order.update({
    where: { id },
    data: updateData,
  })
}

// 注文ステータス遷移の妥当性ルール・関数は constants/orders.ts へ移動
// クライアント・サーバー双方から prisma 依存なしで参照できるようにするため
export { ORDER_STATUS_TRANSITIONS, canTransitionOrderStatus } from '@/constants/orders'

// 追加 (#117): 返金完了情報の保存
export const markOrderRefunded = async (
  id: string,
  data: { amount: number; stripeRefundId: string },
) => {
  return prisma.order.update({
    where: { id },
    data: {
      refundedAmount: data.amount,
      refundedAt: new Date(),
      stripeRefundId: data.stripeRefundId,
    },
  })
}

// 注文件数取得（管理画面ページネーション用）
export const countOrders = async (params: { status?: OrderStatus } = {}) => {
  const { status } = params
  return prisma.order.count({
    where: { ...(status ? { status } : {}) },
  })
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
