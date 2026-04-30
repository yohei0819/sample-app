// 管理画面ダッシュボード用集計クエリ
import { prisma } from '@/lib/db/prisma'
import { fillMissingBuckets, type Granularity, type SalesBucket } from '@/lib/salesReport'

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

// 追加 (#133): 期間指定の売上推移を集計する
// - 対象ステータス: PAID 以降（PAID / SHIPPED / DELIVERED / RETURN_REQUESTED / RETURNED / REFUNDED）
//   PENDING・CANCELLED は除外
// - 集計はタイムゾーン Asia/Tokyo 固定（date_trunc を AT TIME ZONE で適用）
// - refund は Order.refundedAmount の合計（純売上 = gross - refund）
// - 期間は半開区間 [from, to) として扱う（呼び出し側で from / to を JST 境界に正規化済み）
// - 欠損バケットは fillMissingBuckets で 0 埋めし、グラフ表示用の連続配列にする
export const findSalesByPeriod = async (params: {
  from: Date
  to: Date
  granularity: Granularity
}): Promise<SalesBucket[]> => {
  const { from, to, granularity } = params

  // date_trunc 用の単位文字列・to_char 用のフォーマット文字列はホワイトリスト切替で安全に渡す。
  // 注: $queryRaw のタグ付きテンプレートでは ${...} がプレースホルダ ($1, $2) としてバインドされるため、
  //     文字列連結による SQL インジェクションは発生しない。date_trunc(text, timestamp) と
  //     to_char(timestamp, text) は両方とも text 引数を受け付ける。
  const truncUnit = granularity === 'month' ? 'month' : 'day'
  const fmt = granularity === 'month' ? 'YYYY-MM' : 'YYYY-MM-DD'

  // status の IN 句は文字列配列でリテラル化される。CANCELLED / PENDING は対象外。
  const includedStatuses = [
    'PAID',
    'SHIPPED',
    'DELIVERED',
    'RETURN_REQUESTED',
    'RETURNED',
    'REFUNDED',
  ]

  const rows = await prisma.$queryRaw<
    Array<{ bucket: string; orderCount: bigint; gross: bigint; refund: bigint }>
  >`
    SELECT
      to_char(date_trunc(${truncUnit}, ("createdAt" AT TIME ZONE 'Asia/Tokyo')), ${fmt}) AS bucket,
      COUNT(*)::bigint AS "orderCount",
      COALESCE(SUM("totalPrice"), 0)::bigint AS gross,
      COALESCE(SUM(COALESCE("refundedAmount", 0)), 0)::bigint AS refund
    FROM orders
    WHERE status::text = ANY(${includedStatuses}::text[])
      AND "createdAt" >= ${from}
      AND "createdAt" < ${to}
    GROUP BY bucket
    ORDER BY bucket ASC
  `

  // bigint → number に正規化（金額・件数とも JS の安全整数範囲内を想定）
  const normalized = rows.map((r) => ({
    bucket: r.bucket,
    orderCount: Number(r.orderCount),
    gross: Number(r.gross),
    refund: Number(r.refund),
  }))

  return fillMissingBuckets(normalized, from, to, granularity)
}
