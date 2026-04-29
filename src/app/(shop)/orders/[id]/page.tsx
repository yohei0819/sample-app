// 注文詳細ページ（Server Component）
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { findOrderById } from '@/lib/db/orders'
import { OrderDetail } from '@/components/features/orders/OrderDetail'

type Props = {
  // 変更: Next.js 15 の非同期 params
  params: Promise<{ id: string }>
}

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { id } = await params // 変更
  return { title: `注文詳細 #${id.slice(0, 8)}` }
}

export default async function OrderDetailPage({ params }: Props) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login?redirect=/orders')
  }

  const { id } = await params // 変更
  const order = await findOrderById(id)

  // 注文が存在しない、または本人のものでない場合は404（OWASP A01対策）
  if (!order || order.userId !== session.user.id) {
    notFound()
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <OrderDetail order={order} />
    </main>
  )
}
