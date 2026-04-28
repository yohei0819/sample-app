import { prisma } from '@/lib/db/prisma'
import type { Prisma } from '@/generated/prisma/client'

// カテゴリ一覧取得（名前昇順）
export const findAllCategories = async () => {
  return prisma.category.findMany({ orderBy: { name: 'asc' } })
}

// カテゴリ一覧取得（商品数付き、管理画面用）
export const findAllCategoriesWithCount = async () => {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  })
}

// カテゴリ1件取得（管理画面用）
export const findCategoryById = async (id: string) => {
  return prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  })
}

// カテゴリ作成（管理画面用）
export const createCategory = async (data: Prisma.CategoryCreateInput) => {
  return prisma.category.create({ data })
}

// カテゴリ更新（管理画面用）
export const updateCategory = async (id: string, data: Prisma.CategoryUpdateInput) => {
  return prisma.category.update({ where: { id }, data })
}

// カテゴリ削除（管理画面用）
export const deleteCategory = async (id: string) => {
  return prisma.category.delete({ where: { id } })
}
