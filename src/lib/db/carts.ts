// カートDB操作（#119）
import 'server-only'
import { prisma } from '@/lib/db/prisma'
export { computeMergedCart } from '@/lib/cartMerge'
export type { LocalCartItem, MergedItem } from '@/lib/cartMerge'

// ユーザーのカートを items 込みで取得（無ければ作成）
export const getOrCreateCart = async (userId: string) => {
  const existing = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  })
  if (existing) return existing
  return prisma.cart.create({
    data: { userId },
    include: { items: { include: { product: true } } },
  })
}

// アイテムを追加 or 数量加算（在庫上限でクランプ）
export const addCartItem = async (params: {
  userId: string
  productId: string
  quantity: number
}) => {
  const { userId, productId, quantity } = params
  const cart = await getOrCreateCart(userId)
  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product) throw new Error('商品が見つかりません')

  const existing = cart.items.find((i) => i.productId === productId)
  const desired = (existing?.quantity ?? 0) + quantity
  // 在庫上限でクランプ
  const clamped = Math.min(desired, product.stock)
  if (clamped <= 0) throw new Error('在庫がありません')

  if (existing) {
    return prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: clamped },
    })
  }
  return prisma.cartItem.create({
    data: { cartId: cart.id, productId, quantity: clamped },
  })
}

// 数量更新（0以下なら削除）
export const updateCartItemQuantity = async (params: {
  userId: string
  productId: string
  quantity: number
}) => {
  const { userId, productId, quantity } = params
  const cart = await getOrCreateCart(userId)
  const item = cart.items.find((i) => i.productId === productId)
  if (!item) return null

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: item.id } })
    return null
  }
  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product) throw new Error('商品が見つかりません')
  const clamped = Math.min(quantity, product.stock)
  return prisma.cartItem.update({
    where: { id: item.id },
    data: { quantity: clamped },
  })
}

// アイテム削除
export const removeCartItem = async (params: { userId: string; productId: string }) => {
  const cart = await getOrCreateCart(params.userId)
  const item = cart.items.find((i) => i.productId === params.productId)
  if (!item) return false
  await prisma.cartItem.delete({ where: { id: item.id } })
  return true
}

// カートをクリア
export const clearCart = async (userId: string) => {
  const cart = await prisma.cart.findUnique({ where: { userId } })
  if (!cart) return
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
}

// マージ用: ローカルカートの items を DB カートに合算（在庫上限でクランプ）
export const mergeLocalCart = async (
  userId: string,
  localItems: { productId: string; quantity: number }[],
) => {
  if (localItems.length === 0) return
  const cart = await getOrCreateCart(userId)
  // 商品在庫を一括取得
  const products = await prisma.product.findMany({
    where: { id: { in: localItems.map((i) => i.productId) } },
    select: { id: true, stock: true },
  })
  const stockMap = new Map(products.map((p) => [p.id, p.stock]))

  for (const local of localItems) {
    if (local.quantity <= 0) continue
    const stock = stockMap.get(local.productId)
    if (stock === undefined || stock <= 0) continue // 商品が無効 or 在庫なし
    const existing = cart.items.find((i) => i.productId === local.productId)
    const merged = (existing?.quantity ?? 0) + local.quantity
    const clamped = Math.min(merged, stock)
    if (clamped <= 0) continue

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: clamped },
      })
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId: local.productId, quantity: clamped },
      })
    }
  }
}
