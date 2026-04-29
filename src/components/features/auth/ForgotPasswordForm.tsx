'use client'

// パスワードリセット要求フォーム（#129）
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '@/lib/validators/auth'

export const ForgotPasswordForm = () => {
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setServerError(null)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        // レート制限などの失敗
        const json = (await res.json().catch(() => ({}))) as { error?: string }
        setServerError(json.error ?? 'リクエストに失敗しました')
        return
      }
      setSuccess(true)
    } catch {
      setServerError('通信エラーが発生しました')
    }
  }

  if (success) {
    return (
      <div className="space-y-3" role="status" aria-live="polite">
        <p className="text-sm">
          リクエストを受け付けました。ご登録のメールアドレス宛にリセット用のリンクを送信しました。
          メールをご確認ください。
        </p>
        <p className="text-xs text-muted-foreground">
          メールが届かない場合は、迷惑メールフォルダもご確認ください。
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">メールアドレス</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-describedby={errors.email ? 'email-error' : undefined}
          {...register('email')}
        />
        {errors.email && (
          <p id="email-error" className="text-sm text-destructive" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      {serverError && (
        <p className="text-sm text-destructive" role="alert">
          {serverError}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? '送信中...' : 'リセットリンクを送信'}
      </Button>
    </form>
  )
}
