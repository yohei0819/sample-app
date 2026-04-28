import { prisma } from '@/lib/db/prisma'

// ユーザーのウィッシュリストをitems付きで取得（存在しない場合はnull）
export const findWishlistByUserId = async (userId: string) => {
  return prisma.wishlist.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: { category: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
}

// ウィッシュリストに登録済みの商品IDセットを取得（商品一覧でのバッジ表示用）
export const findWishlistedProductIds = async (userId: string): Promise<Set<string>> => {
  const wishlist = await prisma.wishlist.findUnique({
    where: { userId },
    select: {
      items: { select: { productId: true } },
    },
  })
  const ids = wishlist?.items.map((item) => item.productId) ?? []
  return new Set(ids)
}

// 商品がウィッシュリストに登録済みか確認
export const isProductInWishlist = async (userId: string, productId: string): Promise<boolean> => {
  const wishlist = await prisma.wishlist.findUnique({
    where: { userId },
    select: { id: true },
  })
  if (!wishlist) return false

  const item = await prisma.wishlistItem.findUnique({
    where: {
      wishlistId_productId: { wishlistId: wishlist.id, productId },
    },
    select: { id: true },
  })
  return item !== null
}

// ウィッシュリストへ商品を追加（ウィッシュリスト未作成の場合はupsertで作成）
export const addProductToWishlist = async (userId: string, productId: string) => {
  // ウィッシュリストをupsertで取得・作成
  const wishlist = await prisma.wishlist.upsert({
    where: { userId },
    create: { userId },
    update: {},
    select: { id: true },
  })

  // WishlistItemをupsert（重複登録防止）
  return prisma.wishlistItem.upsert({
    where: {
      wishlistId_productId: { wishlistId: wishlist.id, productId },
    },
    create: { wishlistId: wishlist.id, productId },
    update: {},
  })
}

// ウィッシュリストから商品を削除
export const removeProductFromWishlist = async (
  userId: string,
  productId: string,
): Promise<void> => {
  const wishlist = await prisma.wishlist.findUnique({
    where: { userId },
    select: { id: true },
  })
  if (!wishlist) return

  await prisma.wishlistItem.deleteMany({
    where: { wishlistId: wishlist.id, productId },
  })
}
