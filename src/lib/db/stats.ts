// 管理画面ダッシュボード用集計クエリ
import { prisma } from '@/lib/db/prisma'

// ダッシュボード集計結果の型
export type DashboardStats = {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalUsers: number
}

// 最新注文の型
export type RecentOrder = {
  id: string
  status: string
  totalPrice: number
  createdAt: Date
  user: {
    id: string
    email: string
    name: string | null
  }
}

// ダッシュボード統計取得
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const [revenueResult, totalOrders, totalProducts, totalUsers] = await Promise.all([
    // 売上合計（PAID・SHIPPED・DELIVERED のみ）
    prisma.order.aggregate({
      _sum: { totalPrice: true },
      where: { status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] } },
    }),
    // 注文総数
    prisma.order.count(),
    // 商品総数（公開中）
    prisma.product.count({ where: { isPublished: true } }),
    // ユーザー総数
    prisma.user.count(),
  ])

  return {
    totalRevenue: revenueResult._sum.totalPrice ?? 0,
    totalOrders,
    totalProducts,
    totalUsers,
  }
}

// 最新注文一覧取得（上位10件）
export const getRecentOrders = async (): Promise<RecentOrder[]> => {
  return prisma.order.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      status: true,
      totalPrice: true,
      createdAt: true,
      user: {
        select: { id: true, email: true, name: true },
      },
    },
  })
}
