// 簡易レートリミッタ（メモリ内マップ・単一プロセス前提）
// 注意: 本番のマルチインスタンス環境では Redis 等の外部ストアに置き換えること
import 'server-only'
import { NextResponse } from 'next/server'
import {
  RATE_LIMITS,
  RATE_LIMIT_ERROR_CODE,
  RATE_LIMIT_WINDOW_MS,
  type RateLimitKey,
} from '@/constants/rateLimit'

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

// 追加: クライアント識別子を取得（IP優先・なければ匿名）
export const getClientIdentifier = (req: Request): string => {
  const forwardedFor = req.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  const realIp = req.headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  return 'anonymous'
}

// 追加: ルート種別ごとに事前定義された制限を適用し、超過時は429 NextResponseを返す
export const enforceRateLimit = (
  routeKey: RateLimitKey,
  req: Request,
): NextResponse | null => {
  const limit = RATE_LIMITS[routeKey]
  const identifier = getClientIdentifier(req)
  const bucketKey = `${routeKey}:${identifier}`
  const allowed = checkRateLimit(bucketKey, limit, RATE_LIMIT_WINDOW_MS)
  if (allowed) return null

  const bucket = buckets.get(bucketKey)
  const retryAfterSec = bucket
    ? Math.max(Math.ceil((bucket.resetAt - Date.now()) / 1000), 1)
    : Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)

  return NextResponse.json(
    {
      error: 'リクエストが多すぎます。しばらく待ってから再試行してください',
      code: RATE_LIMIT_ERROR_CODE,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfterSec),
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': '0',
      },
    },
  )
}

// テスト用: バケット全消去
export const __resetRateLimitForTest = () => {
  buckets.clear()
}

