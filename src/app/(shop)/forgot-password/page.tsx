import type { Metadata } from 'next'
import Link from 'next/link'
import { ForgotPasswordForm } from '@/components/features/auth/ForgotPasswordForm'
import { AUTH_ROUTES } from '@/constants/auth'

export const metadata: Metadata = {
  title: 'パスワードをお忘れの方',
  description: 'パスワードリセット用のメールを送信します',
}

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-lg border bg-card p-8 shadow-sm">
        <h1 className="mb-2 text-center text-2xl font-bold tracking-tight">
          パスワードをお忘れの方
        </h1>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          ご登録のメールアドレスを入力してください。リセット用のリンクをお送りします。
        </p>
        <ForgotPasswordForm />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link
            href={AUTH_ROUTES.LOGIN}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            ログインに戻る
          </Link>
        </p>
      </div>
    </div>
  )
}
