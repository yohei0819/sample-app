// カートマージのピュアロジック（#119）
// server-only に依存しないため Vitest で単独テスト可能

export type LocalCartItem = { productId: string; quantity: number }
export type MergedItem = { productId: string; quantity: number }

// サーバーカートとローカルカートをマージし、productId 毎の最終数量を返す
// - 同一 productId は数量を合算
// - 合算後は stockMap の在庫上限でクランプ
// - 在庫が0 or 不明の productId は除外
// - quantity <= 0 のローカルアイテムは無視
export const computeMergedCart = (
  serverItems: { productId: string; quantity: number }[],
  localItems: { productId: string; quantity: number }[],
  stockMap: Map<string, number>,
): MergedItem[] => {
  const result = new Map<string, number>()
  for (const s of serverItems) {
    if (s.quantity > 0) result.set(s.productId, s.quantity)
  }
  for (const l of localItems) {
    if (l.quantity <= 0) continue
    const stock = stockMap.get(l.productId)
    if (stock === undefined || stock <= 0) continue
    const merged = (result.get(l.productId) ?? 0) + l.quantity
    result.set(l.productId, Math.min(merged, stock))
  }
  return Array.from(result.entries()).map(([productId, quantity]) => ({ productId, quantity }))
}
