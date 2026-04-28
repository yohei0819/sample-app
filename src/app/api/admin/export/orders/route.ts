// 追加: 管理画面 注文一覧 CSV エクスポート API
// GET /api/admin/export/orders?from=YYYY-MM-DD&to=YYYY-MM-DD
// 管理者ロール必須。Excel 互換のため UTF-8 BOM 付き CSV を返す。
import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireAdmin } from '@/lib/admin-auth'
import { toCsvWithBom } from '@/lib/csv'

const ORDER_CSV_HEADERS = [
  '注文ID',
  '注文日時',
  'ユーザーID',
  'メールアドレス',
  '氏名',
  'ステータス',
  '商品ID',
  '商品名',
  '単価',
  '数量',
  '小計',
  '合計金額',
  'クーポンコード',
] as const

const parseDate = (s: string | null): Date | undefined => {
  if (!s) return undefined
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? undefined : d
}

export const GET = async (req: NextRequest) => {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ error: check.error }, { status: check.status })
  }

  const from = parseDate(req.nextUrl.searchParams.get('from'))
  const to = parseDate(req.nextUrl.searchParams.get('to'))

  // 期間フィルター（指定があれば適用）
  const where = {
    ...(from || to
      ? {
          createdAt: {
            ...(from ? { gte: from } : {}),
            ...(to ? { lte: to } : {}),
          },
        }
      : {}),
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      user: { select: { id: true, email: true, name: true } },
      items: { include: { product: { select: { id: true, name: true } } } },
      coupon: { select: { code: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  // 注文明細を1行=1アイテムで展開する
  const rows: unknown[][] = []
  for (const order of orders) {
    if (order.items.length === 0) {
      rows.push([
        order.id,
        order.createdAt.toISOString(),
        order.user.id,
        order.user.email,
        order.user.name ?? '',
        order.status,
        '',
        '',
        '',
        '',
        '',
        order.totalPrice,
        order.coupon?.code ?? '',
      ])
      continue
    }
    for (const item of order.items) {
      rows.push([
        order.id,
        order.createdAt.toISOString(),
        order.user.id,
        order.user.email,
        order.user.name ?? '',
        order.status,
        item.product.id,
        item.product.name,
        item.unitPrice,
        item.quantity,
        item.unitPrice * item.quantity,
        order.totalPrice,
        order.coupon?.code ?? '',
      ])
    }
  }

  const buf = toCsvWithBom(ORDER_CSV_HEADERS, rows)
  const filename = `orders_${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(buf as unknown as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
