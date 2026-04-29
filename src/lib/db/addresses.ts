// アドレス帳 DB 操作（#134）
import { prisma } from '@/lib/db/prisma'
import type { AddressInput } from '@/lib/validators/address'

// ユーザーのアドレス一覧（デフォルト → 新しい順）
export const findAddressesByUserId = async (userId: string) => {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  })
}

// ID 指定で取得
export const findAddressById = async (id: string) => {
  return prisma.address.findUnique({ where: { id } })
}

// 新規作成（isDefault=true ならトランザクションで他をfalseに）
export const createAddress = async (userId: string, input: AddressInput) => {
  const isDefault = Boolean(input.isDefault)
  return prisma.$transaction(async (tx) => {
    if (isDefault) {
      await tx.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      })
    }
    return tx.address.create({
      data: {
        userId,
        name: input.name,
        postalCode: input.postalCode,
        prefecture: input.prefecture,
        city: input.city,
        addressLine1: input.addressLine1,
        addressLine2: input.addressLine2 ?? null,
        phone: input.phone,
        isDefault,
      },
    })
  })
}

// 更新（isDefault=true ならトランザクションで他をfalseに）
export const updateAddress = async (
  id: string,
  userId: string,
  input: AddressInput,
) => {
  const isDefault = Boolean(input.isDefault)
  return prisma.$transaction(async (tx) => {
    if (isDefault) {
      await tx.address.updateMany({
        where: { userId, isDefault: true, NOT: { id } },
        data: { isDefault: false },
      })
    }
    return tx.address.update({
      where: { id },
      data: {
        name: input.name,
        postalCode: input.postalCode,
        prefecture: input.prefecture,
        city: input.city,
        addressLine1: input.addressLine1,
        addressLine2: input.addressLine2 ?? null,
        phone: input.phone,
        isDefault,
      },
    })
  })
}

// 削除
export const deleteAddress = async (id: string) => {
  return prisma.address.delete({ where: { id } })
}
