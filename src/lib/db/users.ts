import { prisma } from '@/lib/db/prisma'
import type { Prisma, Role } from '@/generated/prisma/client'

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
      isActive: true, // 追加
      createdAt: true,
      updatedAt: true,
      _count: { select: { orders: true } }, // 追加: 管理画面で注文件数を表示
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

// 追加: 管理画面用 全ユーザー一覧（isActive を含む）
export const findAllUsers = async (take?: number) => {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    ...(take !== undefined ? { take } : {}),
    orderBy: { createdAt: 'desc' },
  })
}

// 追加: ユーザーのロールを更新
export const updateUserRole = async (id: string, role: Role) => {
  return prisma.user.update({
    where: { id },
    data: { role },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

// 追加: ユーザーの有効/無効ステータスを更新
export const updateUserActiveStatus = async (id: string, isActive: boolean) => {
  return prisma.user.update({
    where: { id },
    data: { isActive },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}
