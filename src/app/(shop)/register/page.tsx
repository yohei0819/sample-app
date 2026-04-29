import type { Metadata } from 'next'
import Link from 'next/link'
import { RegisterForm } from '@/components/features/auth/RegisterForm'
import { GoogleSignInButton } from '@/components/features/auth/GoogleSignInButton' // 追加 (#105)
import { AUTH_ROUTES } from '@/constants/auth'
import { env } from '@/env' // 追加 (#105)

export const metadata: Metadata = {
  title: '会員登録',
  description: 'SampleShop に会員登録する',
}

export default function RegisterPage() {
  // 追加 (#105): Google OAuth が有効な時のみボタンを表示
  const isGoogleEnabled = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET)

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-lg border bg-card p-8 shadow-sm">
        <h1 className="mb-6 text-center text-2xl font-bold tracking-tight">会員登録</h1>
        <RegisterForm />
        {isGoogleEnabled && (
          <>
            <div className="my-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">または</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <GoogleSignInButton />
          </>
        )}
        <p className="mt-4 text-center text-sm text-muted-foreground">
          既にアカウントをお持ちの方は{' '}
          <Link
            href={AUTH_ROUTES.LOGIN}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            ログイン
          </Link>
        </p>
      </div>
    </div>
  )
}
