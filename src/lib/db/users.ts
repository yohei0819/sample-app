import { prisma } from '@/lib/db/prisma'
import type { Prisma } from '@/generated/prisma/client'

// メールアドレスでユーザーを取得
export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({ where: { email } })
}

// IDでユーザーを取得（OWASP A02対策: passwordHash を除外して返す）
export const findUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

// ユーザー作成
export const createUser = async (data: Prisma.UserCreateInput) => {
  return prisma.user.create({ data })
}

// ユーザー更新
export const updateUser = async (id: string, data: Prisma.UserUpdateInput) => {
  return prisma.user.update({ where: { id }, data })
}

// ユーザー一覧取得（管理画面用）
export const findUsers = async (params: { take?: number; skip?: number }) => {
  const { take = 50, skip = 0 } = params
  return prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true },
    take,
    skip,
    orderBy: { createdAt: 'desc' },
  })
}
