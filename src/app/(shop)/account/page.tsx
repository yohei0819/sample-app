// マイページトップ（プロフィール・注文サマリー）（Server Component）
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { User } from 'lucide-react'
import { auth } from '@/lib/auth'
import { findUserById } from '@/lib/db/users'
import { findOrdersByUserId } from '@/lib/db/orders'
import { ProfileForm } from '@/components/features/account/ProfileForm'
import { OrderCard } from '@/components/features/orders/OrderCard'

export const metadata: Metadata = {
  title: 'マイページ',
}

export default async function AccountPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login?redirect=/account')
  }

  const [user, orders] = await Promise.all([
    findUserById(session.user.id),
    findOrdersByUserId(session.user.id, { take: 3 }), // 変更: 直近3件のみ取得してパフォーマンス改善
  ])

  if (!user) {
    redirect('/login')
  }

  const recentOrders = orders

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold tracking-tight">マイページ</h1>

      <div className="space-y-8">
        {/* プロフィールセクション */}
        <section aria-labelledby="profile-heading">
          <div className="rounded-lg border bg-card">
            <div className="flex items-center gap-3 border-b p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <User size={20} className="text-muted-foreground" aria-hidden="true" />
              </div>
              <h2 id="profile-heading" className="font-semibold">
                プロフィール
              </h2>
            </div>
            <div className="p-6">
              <ProfileForm defaultValues={{ name: user.name ?? '', email: user.email }} />
            </div>
          </div>
        </section>

        {/* 配送先アドレス帳へのリンク (#134) */}
        <section aria-labelledby="addresses-link-heading">
          <div className="flex items-center justify-between rounded-lg border bg-card p-6">
            <div>
              <h2 id="addresses-link-heading" className="font-semibold">配送先アドレス帳</h2>
              <p className="text-sm text-muted-foreground mt-1">よく使う配送先を保存できます</p>
            </div>
            <Link
              href="/account/addresses"
              className="text-sm font-medium text-primary hover:underline"
            >
              管理する
            </Link>
          </div>
        </section>

        {/* 最近の注文セクション */}
        <section aria-labelledby="recent-orders-heading">
          <div className="flex items-center justify-between mb-3">
            <h2 id="recent-orders-heading" className="font-semibold">
              最近の注文
            </h2>
            <Link
              href="/orders"
              className="text-sm text-primary hover:underline"
            >
              すべて見る
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="rounded-lg border bg-card p-8 text-center">
              <p className="text-sm text-muted-foreground">まだ注文がありません。</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {recentOrders.map((order) => (
                <li key={order.id}>
                  <OrderCard order={order} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}
