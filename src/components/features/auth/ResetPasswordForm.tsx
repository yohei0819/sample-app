'use client'

// パスワード再設定フォーム（#129）
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '@/lib/validators/auth'
import { AUTH_ROUTES } from '@/constants/auth'

type Props = {
  token: string
}

export const ResetPasswordForm = ({ token }: Props) => {
  const router = useRouter()
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: '' },
  })

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setServerError(null)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string }
        setServerError(json.error ?? 'パスワードのリセットに失敗しました')
        return
      }
      setSuccess(true)
      // 3秒後にログイン画面へ
      setTimeout(() => {
        router.push(AUTH_ROUTES.LOGIN)
      }, 2000)
    } catch {
      setServerError('通信エラーが発生しました')
    }
  }

  if (success) {
    return (
      <div className="space-y-3" role="status" aria-live="polite">
        <p className="text-sm">
          パスワードを更新しました。新しいパスワードでログインしてください。
        </p>
        <p className="text-xs text-muted-foreground">まもなくログイン画面に移動します...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <input type="hidden" {...register('token')} />

      <div className="space-y-2">
        <Label htmlFor="password">新しいパスワード</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          aria-describedby={errors.password ? 'password-error' : undefined}
          {...register('password')}
        />
        {errors.password && (
          <p id="password-error" className="text-sm text-destructive" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      {serverError && (
        <p className="text-sm text-destructive" role="alert">
          {serverError}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? '更新中...' : 'パスワードを更新'}
      </Button>
    </form>
  )
}
