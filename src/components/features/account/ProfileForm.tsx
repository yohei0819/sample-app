'use client'
// プロフィール編集フォームコンポーネント
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const profileSchema = z.object({
  name: z.string().min(1, '名前を入力してください').max(50, '名前は50文字以内で入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください'),
})

type ProfileFormValues = z.infer<typeof profileSchema>

type Props = {
  defaultValues: ProfileFormValues
}

export const ProfileForm = ({ defaultValues }: Props) => {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  })

  const onSubmit = async (values: ProfileFormValues) => {
    setServerError(null)
    setSuccess(false)

    try {
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!res.ok) {
        const json: unknown = await res.json()
        const message =
          json !== null && typeof json === 'object' && 'error' in json && typeof (json as Record<string, unknown>).error === 'string'
            ? (json as Record<string, unknown>).error as string
            : 'プロフィールの更新に失敗しました'
        setServerError(message)
        return
      }

      setSuccess(true)
      router.refresh()
    } catch {
      setServerError('通信エラーが発生しました。もう一度お試しください。')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {serverError && (
        <div role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {serverError}
        </div>
      )}
      {success && (
        <div role="status" className="rounded-md bg-green-50 p-3 text-sm text-green-700">
          プロフィールを更新しました
        </div>
      )}

      {/* 名前 */}
      <div className="space-y-1">
        <label htmlFor="name" className="block text-sm font-medium">
          名前
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
          {...register('name')}
        />
        {errors.name && (
          <p id="name-error" role="alert" className="text-xs text-red-600">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* メールアドレス */}
      <div className="space-y-1">
        <label htmlFor="email" className="block text-sm font-medium">
          メールアドレス
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          {...register('email')}
        />
        {errors.email && (
          <p id="email-error" role="alert" className="text-xs text-red-600">
            {errors.email.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {isSubmitting ? '保存中...' : '変更を保存'}
      </button>
    </form>
  )
}
