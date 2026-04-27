import { prisma } from '@/lib/db/prisma'

// カテゴリ一覧取得（名前昇順）
export const findAllCategories = async () => {
  return prisma.category.findMany({ orderBy: { name: 'asc' } })
}
