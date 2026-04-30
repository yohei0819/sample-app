// 追加 (#133): 売上レポート KPI カード（Server Component）
// 期間内の合計売上 / 注文数 / 平均注文単価 / 返金額 を表示する。
import type { ReactNode } from 'react'
import { DollarSign, Receipt, ShoppingCart, Undo2 } from 'lucide-react'
import type { SalesKpi } from '@/lib/salesReport'

type Props = {
  kpi: SalesKpi
}

type Card = {
  title: string
  value: string
  description: string
  icon: ReactNode
}

export const SalesReportKpi = ({ kpi }: Props) => {
  const cards: Card[] = [
    {
      title: '期間内売上合計',
      value: `¥${kpi.totalGross.toLocaleString('ja-JP')}`,
      description: '対象注文の totalPrice 合計',
      icon: <DollarSign size={24} className="text-green-600" aria-hidden="true" />,
    },
    {
      title: '注文数',
      value: kpi.totalOrders.toLocaleString('ja-JP'),
      description: 'PAID 以降のステータス',
      icon: <ShoppingCart size={24} className="text-blue-600" aria-hidden="true" />,
    },
    {
      title: '平均注文単価',
      value: `¥${kpi.averageOrderValue.toLocaleString('ja-JP')}`,
      description: '売上合計 ÷ 注文数',
      icon: <Receipt size={24} className="text-orange-600" aria-hidden="true" />,
    },
    {
      title: '返金額',
      value: `¥${kpi.totalRefund.toLocaleString('ja-JP')}`,
      description: '純売上は ¥' + kpi.totalNet.toLocaleString('ja-JP'),
      icon: <Undo2 size={24} className="text-rose-600" aria-hidden="true" />,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.title} className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
            {card.icon}
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight">{card.value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{card.description}</p>
        </div>
      ))}
    </div>
  )
}
