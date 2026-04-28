// 簡易レートリミッタ（メモリ内マップ・単一プロセス前提）
// 注意: 本番のマルチインスタンス環境では Redis 等の外部ストアに置き換えること
const buckets = new Map<string, { count: number; resetAt: number }>()

// 指定キーがウィンドウ内に limit 回未満なら true、超過なら false を返す
export const checkRateLimit = (
  key: string,
  limit: number,
  windowMs: number,
): boolean => {
  const now = Date.now()
  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (bucket.count >= limit) return false
  bucket.count++
  return true
}
