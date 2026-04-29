'use client'
// 顧客向け 注文キャンセルボタン（#130）
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

type Props = {
  orderId: string
  isPaid: boolean
}

export const CancelOrderButton = ({ orderId, isPaid }: Props) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = () => {
    setError(null)
    startTransition(async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}/cancel`, {
          method: 'POST',
        })
        if (!res.ok) {
          const data: unknown = await res.json().catch(() => ({}))
          const message =
            data &&
            typeof data === 'object' &&
            'error' in data &&
            typeof (data as { error: unknown }).error === 'string'
              ? (data as { error: string }).error
              : 'キャンセル処理に失敗しました'
          setError(message)
          return
        }
        setOpen(false)
        router.refresh()
      } catch {
        setError('キャンセル処理に失敗しました')
      }
    })
  }

  if (!open) {
    return (
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        注文をキャンセル
      </Button>
    )
  }

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <p className="text-sm font-medium">注文をキャンセルしますか？</p>
      <p className="text-xs text-muted-foreground">
        {isPaid
          ? 'お支払い済みの注文をキャンセルすると、Stripe を通じて全額返金されます。返金には数営業日かかる場合があります。'
          : '未決済の注文をキャンセルします。この操作は取り消せません。'}
      </p>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="destructive"
          onClick={handleSubmit}
          disabled={isPending}
        >
          {isPending ? 'キャンセル処理中...' : 'はい、キャンセルする'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setOpen(false)
            setError(null)
          }}
          disabled={isPending}
        >
          戻る
        </Button>
      </div>
    </div>
  )
}
