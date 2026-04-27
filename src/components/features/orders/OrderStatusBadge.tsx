// 注文ステータスバッジコンポーネント
import type { OrderStatus } from '@/generated/prisma/client'
import { ORDER_STATUS_COLOR, ORDER_STATUS_LABEL } from '@/constants/orders'

type Props = {
  status: OrderStatus
}

export const OrderStatusBadge = ({ status }: Props) => {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ORDER_STATUS_COLOR[status]}`}
    >
      {ORDER_STATUS_LABEL[status]}
    </span>
  )
}
