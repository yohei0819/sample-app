import { prisma } from '@/lib/db/prisma'
import type { Prisma } from '@/generated/prisma/client'

// クーポン一覧取得（管理画面用）
export const findAllCoupons = async () => {
  return prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { orders: true } } },
  })
}

// クーポン1件取得（ID）
export const findCouponById = async (id: string) => {
  return prisma.coupon.findUnique({ where: { id } })
}

// クーポン1件取得（コード）
export const findCouponByCode = async (code: string) => {
  return prisma.coupon.findUnique({ where: { code } })
}

// クーポン作成（管理画面用）
export const createCoupon = async (data: Prisma.CouponCreateInput) => {
  return prisma.coupon.create({ data })
}

// クーポン更新（管理画面用）
export const updateCoupon = async (id: string, data: Prisma.CouponUpdateInput) => {
  return prisma.coupon.update({ where: { id }, data })
}

// クーポン使用回数+1（注文確定時）
export const incrementCouponUsedCount = async (id: string) => {
  return prisma.coupon.update({
    where: { id },
    data: { usedCount: { increment: 1 } },
  })
}

// クーポン使用回数アトミック更新（レースコンディション対策） // 追加
// 更新できた行数（1 = 成功、0 = 上限到達済み）を返す
export const incrementCouponUsedCountAtomic = async (
  couponId: string,
  maxUses: number | null,
): Promise<number> => {
  const result = await prisma.coupon.updateMany({
    where: {
      id: couponId,
      OR: [
        { maxUses: null },
        ...(maxUses !== null ? [{ usedCount: { lt: maxUses } }] : []),
      ],
    },
    data: { usedCount: { increment: 1 } },
  })
  return result.count
}

// クーポン削除（注文のcouponIdをnullにしてからトランザクションで削除） // 追加
export const deleteCouponWithOrderCleanup = async (id: string) => {
  return prisma.$transaction([
    prisma.order.updateMany({ where: { couponId: id }, data: { couponId: null } }),
    prisma.coupon.delete({ where: { id } }),
  ])
}
