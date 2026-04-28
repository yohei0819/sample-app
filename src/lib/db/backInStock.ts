// バックインストック通知購読のリポジトリ関数
import { prisma } from '@/lib/db/prisma'

// 購読登録（既存ならno-op）
// 同じ email × productId の組み合わせは @@unique 制約で1件のみ
export const createSubscription = async (email: string, productId: string) => {
  return prisma.backInStockSubscription.upsert({
    where: { email_productId: { email, productId } },
    update: {}, // 既存ならno-op
    create: { email, productId },
  })
}

// 指定商品の未通知購読一覧を取得
export const findUnnotifiedByProductId = async (productId: string) => {
  return prisma.backInStockSubscription.findMany({
    where: { productId, notified: false },
    orderBy: { createdAt: 'asc' },
  })
}

// 通知済みフラグ更新
export const markAsNotified = async (ids: string[]) => {
  if (ids.length === 0) return { count: 0 }
  return prisma.backInStockSubscription.updateMany({
    where: { id: { in: ids } },
    data: { notified: true, notifiedAt: new Date() },
  })
}

// 通知待ち件数（管理画面用）
export const findActiveSubscriptionsCount = async (productId: string): Promise<number> => {
  return prisma.backInStockSubscription.count({
    where: { productId, notified: false },
  })
}
