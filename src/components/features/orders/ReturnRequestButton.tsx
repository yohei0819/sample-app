'use client'
// 顧客向け 返品申請ボタン（#117）
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

type Props = {
  orderId: string
}

export const ReturnRequestButton = ({ orderId }: Props) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = () => {
    setError(null)
    if (!reason.trim()) {
      setError('返品理由を入力してください')
      return
    }
    startTransition(async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}/return`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: reason.trim() }),
        })
        if (!res.ok) {
          const data: unknown = await res.json().catch(() => ({}))
          const message =
            data &&
            typeof data === 'object' &&
            'error' in data &&
            typeof (data as { error: unknown }).error === 'string'
              ? (data as { error: string }).error
              : '返品申請に失敗しました'
          setError(message)
          return
        }
        setOpen(false)
        setReason('')
        router.refresh()
      } catch {
        setError('返品申請に失敗しました')
      }
    })
  }

  if (!open) {
    return (
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        返品を申請する
      </Button>
    )
  }

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <p className="text-sm font-medium">返品理由を入力してください</p>
      <label htmlFor="return-reason" className="sr-only">
        返品理由
      </label>
      <textarea
        id="return-reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={4}
        maxLength={500}
        className="w-full rounded-md border bg-background p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        placeholder="例: 商品に不具合があった、サイズが合わなかった など"
      />
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="button" onClick={handleSubmit} disabled={isPending}>
          {isPending ? '送信中…' : '申請する'}
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
          キャンセル
        </Button>
      </div>
    </div>
  )
}
