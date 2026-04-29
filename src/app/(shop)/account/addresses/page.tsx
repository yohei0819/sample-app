// 配送先アドレス帳 ページ（#134）
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { auth } from '@/lib/auth'
import { findAddressesByUserId } from '@/lib/db/addresses'
import { AddressBookManager } from '@/components/features/account/AddressBookManager'

export const metadata: Metadata = {
  title: '配送先アドレス帳',
}

export default async function AddressBookPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login?redirect=/account/addresses')
  }

  const addresses = await findAddressesByUserId(session.user.id)

  // Date を ISO 文字列に変換してクライアントへ渡す
  const items = addresses.map((a) => ({
    id: a.id,
    name: a.name,
    postalCode: a.postalCode,
    prefecture: a.prefecture,
    city: a.city,
    addressLine1: a.addressLine1,
    addressLine2: a.addressLine2 ?? '',
    phone: a.phone,
    isDefault: a.isDefault,
  }))

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/account"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        マイページに戻る
      </Link>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">配送先アドレス帳</h1>
      <AddressBookManager initialAddresses={items} />
    </main>
  )
}
