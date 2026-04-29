import type { Metadata } from 'next'
import Link from 'next/link'
import { ResetPasswordForm } from '@/components/features/auth/ResetPasswordForm'
import { AUTH_ROUTES } from '@/constants/auth'

export const metadata: Metadata = {
  title: 'パスワード再設定',
  description: '新しいパスワードを設定します',
}

type Props = {
  searchParams: Promise<{ token?: string }>
}

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token } = await searchParams
  const safeToken = typeof token === 'string' ? token : ''

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-lg border bg-card p-8 shadow-sm">
        <h1 className="mb-2 text-center text-2xl font-bold tracking-tight">パスワード再設定</h1>
        {safeToken ? (
          <>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              新しいパスワードを入力してください。
            </p>
            <ResetPasswordForm token={safeToken} />
          </>
        ) : (
          <>
            <p className="mb-6 text-center text-sm text-destructive">
              リンクが無効です。再度パスワードリセットを依頼してください。
            </p>
            <p className="text-center text-sm">
              <Link
                href={AUTH_ROUTES.FORGOT_PASSWORD}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                パスワードリセットページへ
              </Link>
            </p>
          </>
        )}
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
