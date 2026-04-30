// カートDB操作（#119）
// 変更 (#131): variantId 対応・(productId, variantId) で同一性判定
import 'server-only'
import { prisma } from '@/lib/db/prisma'
export { computeMergedCart } from '@/lib/cartMerge'
export type { LocalCartItem, MergedItem } from '@/lib/cartMerge'

// ユーザーのカートを items 込みで取得（無ければ作成）
export const getOrCreateCart = async (userId: string) => {
  const existing = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true, variant: true } } }, // 変更 (#131): variant を含める
  })
  if (existing) return existing
  return prisma.cart.create({
    data: { userId },
    include: { items: { include: { product: true, variant: true } } },
  })
}

// 追加 (#131): variant 在庫を確認（指定時）し、無ければ Product.stock を返す
const getAvailableStock = async (productId: string, variantId: string | null) => {
  if (variantId) {
    const variant = await prisma.productVariant.findFirst({
      where: { id: variantId, productId },
      select: { stock: true },
    })
    if (!variant) throw new Error('バリエーションが見つかりません')
    return variant.stock
  }
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { stock: true, variants: { select: { id: true } } },
  })
  if (!product) throw new Error('商品が見つかりません')
  // バリエーションあり商品で variantId 未指定はエラー
  if (product.variants.length > 0) {
    throw new Error('バリエーションを選択してください')
  }
  return product.stock
}

// アイテムを追加 or 数量加算（在庫上限でクランプ）
export const addCartItem = async (params: {
  userId: string
  productId: string
  quantity: number
  variantId?: string | null // 追加 (#131)
}) => {
  const { userId, productId, quantity } = params
  const variantId = params.variantId ?? null
  const cart = await getOrCreateCart(userId)
  const stock = await getAvailableStock(productId, variantId)

  const existing = cart.items.find(
    (i) => i.productId === productId && (i.variantId ?? null) === variantId,
  )
  const desired = (existing?.quantity ?? 0) + quantity
  // 在庫上限でクランプ
  const clamped = Math.min(desired, stock)
  if (clamped <= 0) throw new Error('在庫がありません')

  if (existing) {
    return prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: clamped },
    })
  }
  return prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId,
      quantity: clamped,
      ...(variantId ? { variantId } : {}),
    },
  })
}

// 数量更新（0以下なら削除）
export const updateCartItemQuantity = async (params: {
  userId: string
  productId: string
  quantity: number
  variantId?: string | null // 追加 (#131)
}) => {
  const { userId, productId, quantity } = params
  const variantId = params.variantId ?? null
  const cart = await getOrCreateCart(userId)
  const item = cart.items.find(
    (i) => i.productId === productId && (i.variantId ?? null) === variantId,
  )
  if (!item) return null

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: item.id } })
    return null
  }
  const stock = await getAvailableStock(productId, variantId)
  const clamped = Math.min(quantity, stock)
  return prisma.cartItem.update({
    where: { id: item.id },
    data: { quantity: clamped },
  })
}

// アイテム削除
export const removeCartItem = async (params: {
  userId: string
  productId: string
  variantId?: string | null // 追加 (#131)
}) => {
  const variantId = params.variantId ?? null
  const cart = await getOrCreateCart(params.userId)
  const item = cart.items.find(
    (i) => i.productId === params.productId && (i.variantId ?? null) === variantId,
  )
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
// 変更 (#131): variantId 対応
export const mergeLocalCart = async (
  userId: string,
  localItems: { productId: string; quantity: number; variantId?: string | null }[],
) => {
  if (localItems.length === 0) return
  const cart = await getOrCreateCart(userId)

  // 商品在庫を一括取得
  const products = await prisma.product.findMany({
    where: { id: { in: localItems.map((i) => i.productId) } },
    select: { id: true, stock: true, variants: { select: { id: true, stock: true } } },
  })
  const productMap = new Map(products.map((p) => [p.id, p]))

  for (const local of localItems) {
    if (local.quantity <= 0) continue
    const product = productMap.get(local.productId)
    if (!product) continue
    const variantId = local.variantId ?? null

    let stock = 0
    if (variantId) {
      const variant = product.variants.find((v) => v.id === variantId)
      if (!variant) continue
      stock = variant.stock
    } else {
      // バリエーションあり商品で variantId 未指定はスキップ（不正データ）
      if (product.variants.length > 0) continue
      stock = product.stock
    }
    if (stock <= 0) continue

    const existing = cart.items.find(
      (i) => i.productId === local.productId && (i.variantId ?? null) === variantId,
    )
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
        data: {
          cartId: cart.id,
          productId: local.productId,
          quantity: clamped,
          ...(variantId ? { variantId } : {}),
        },
      })
    }
  }
}
