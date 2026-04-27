'use client'

// SessionProvider のクライアントラッパー
import { SessionProvider } from 'next-auth/react'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export const AuthSessionProvider = ({ children }: Props) => {
  return <SessionProvider>{children}</SessionProvider>
}
