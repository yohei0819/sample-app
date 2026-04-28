'use client'

// 在庫切れ商品の再入荷通知購読フォーム
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { subscribeSchema, type SubscribeInput } from '@/lib/validators/backInStock'

type Props = {
  productId: string
}

// 送信ステータス
type Status =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success' }
  | { kind: 'error'; message: string }

export const BackInStockForm = ({ productId }: Props) => {
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SubscribeInput>({
    resolver: zodResolver(subscribeSchema),
    defaultValues: { email: '', productId },
  })

  const onSubmit = async (values: SubscribeInput) => {
    setStatus({ kind: 'submitting' })
    try {
      const res = await fetch('/api/notifications/back-in-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const data: unknown = await res.json().catch(() => ({}))
        const message =
          typeof data === 'object' && data !== null && 'error' in data && typeof (data as { error: unknown }).error === 'string'
            ? (data as { error: string }).error
            : '通知登録に失敗しました'
        setStatus({ kind: 'error', message })
        return
      }
      setStatus({ kind: 'success' })
      reset({ email: '', productId })
    } catch (err) {
      console.error('[BackInStockForm] 送信エラー:', err)
      setStatus({ kind: 'error', message: '通信エラーが発生しました' })
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <h3 className="mb-1 text-sm font-semibold text-gray-900">再入荷通知を受け取る</h3>
      <p className="mb-3 text-xs text-gray-600">
        メールアドレスを登録すると、再入荷した際にお知らせします。
      </p>

      {status.kind === 'success' ? (
        <p className="text-sm font-medium text-green-700" role="status">
          通知を登録しました
        </p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          {/* 追加: productIdをhidden inputとして明示的に送信 */}
          <input type="hidden" {...register('productId')} />
          <div>
            <Label htmlFor="back-in-stock-email" className="sr-only">
              メールアドレス
            </Label>
            <Input
              id="back-in-stock-email"
              type="email"
              placeholder="メールアドレス"
              autoComplete="email"
              aria-invalid={errors.email ? 'true' : 'false'}
              {...register('email')}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>
          <Button type="submit" disabled={status.kind === 'submitting'} className="w-full">
            {status.kind === 'submitting' ? '登録中...' : '通知を受け取る'}
          </Button>
          {status.kind === 'error' && (
            <p className="text-xs text-red-600" role="alert">
              {status.message}
            </p>
          )}
        </form>
      )}
    </div>
  )
}
