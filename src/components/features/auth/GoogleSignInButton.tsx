'use client'
// 追加 (#105): Google OAuth ログインボタン
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { AUTH_ROUTES } from '@/constants/auth'

export const GoogleSignInButton = () => {
  const handleClick = () => {
    void signIn('google', { callbackUrl: AUTH_ROUTES.DEFAULT_REDIRECT })
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClick}
      className="w-full"
      aria-label="Google でログイン"
    >
      {/* 公式 G ロゴ風 SVG */}
      <svg
        aria-hidden="true"
        className="mr-2 h-4 w-4"
        viewBox="0 0 48 48"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="#FFC107"
          d="M43.611 20.083H42V20H24v8h11.303C33.972 31.91 29.36 35 24 35c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.046 5.053 28.793 3 24 3 12.955 3 4 11.955 4 23s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
        />
        <path
          fill="#FF3D00"
          d="M6.306 14.691l6.571 4.819C14.655 16.108 19.001 13 24 13c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.046 5.053 28.793 3 24 3 16.318 3 9.656 7.337 6.306 14.691z"
        />
        <path
          fill="#4CAF50"
          d="M24 43c4.756 0 9.077-1.81 12.337-4.764l-5.703-4.83C28.74 34.91 26.475 35.5 24 35.5c-5.336 0-9.93-3.063-11.265-7.5l-6.518 5.024C9.518 39.59 16.213 43 24 43z"
        />
        <path
          fill="#1976D2"
          d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l5.703 4.83C39.099 35.91 44 30.5 44 23c0-1.341-.138-2.65-.389-3.917z"
        />
      </svg>
      Google でログイン
    </Button>
  )
}
