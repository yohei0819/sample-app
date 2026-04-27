// ダッシュボード統計カードコンポーネント
import type { ReactNode } from 'react'
import { DollarSign, Package, ShoppingCart, Users } from 'lucide-react'
// 変更: コンポーネント名との衝突を避けるためエイリアスでインポート
import type { DashboardStats as DashboardStatsData } from '@/lib/db/stats'

type Props = {
  stats: DashboardStatsData
}

type StatCard = {
  title: string
  value: string
  // 変更: React.ReactNode → ReactNode（明示的インポートに変更）
  icon: ReactNode
  description: string
}

export const DashboardStats = ({ stats }: Props) => {
  const cards: StatCard[] = [
    {
      title: '売上合計',
      value: `¥${stats.totalRevenue.toLocaleString('ja-JP')}`,
      icon: <DollarSign size={24} className="text-green-600" aria-hidden="true" />,
      description: 'PAID・SHIPPED・DELIVERED の合計',
    },
    {
      title: '注文総数',
      value: stats.totalOrders.toLocaleString('ja-JP'),
      icon: <ShoppingCart size={24} className="text-blue-600" aria-hidden="true" />,
      description: '全ステータスを含む',
    },
    {
      title: '公開商品数',
      value: stats.totalProducts.toLocaleString('ja-JP'),
      icon: <Package size={24} className="text-orange-600" aria-hidden="true" />,
      description: '現在公開中の商品',
    },
    {
      title: '会員数',
      value: stats.totalUsers.toLocaleString('ja-JP'),
      icon: <Users size={24} className="text-purple-600" aria-hidden="true" />,
      description: '登録ユーザー総数',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-lg border bg-card p-6 shadow-sm"
        >
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
