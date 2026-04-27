// 管理画面 注文詳細ページ（Server Component）
import { notFound } from 'next/navigation'
import { findOrderById } from '@/lib/db/orders'
import { OrderDetail } from '@/components/features/admin/OrderDetail'

export const metadata = {
  title: '注文詳細 | 管理画面',
}

type Props = {
  params: Promise<{ id: string }>
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params
  const order = await findOrderById(id)

  if (!order) {
    notFound()
  }

  return <OrderDetail order={order} />
}
