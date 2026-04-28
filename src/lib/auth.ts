// NextAuth v5（Auth.js）設定
// 変更: server-only でクライアントバンドルへの混入を防止
import 'server-only'
import bcrypt from 'bcryptjs'
import NextAuth, { type DefaultSession } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { env } from '@/env'
import { findUserByEmail } from '@/lib/db/users'

// Session 型拡張：id・role フィールドを追加
declare module 'next-auth' {
  interface User {
    role: string
  }
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession['user']
  }
}

// 変更: next-auth v5 beta では next-auth/jwt モジュールが未公開のため
// JWT カスタムフィールドは string インデックスで管理する
type JwtToken = {
  id?: string
  role?: string
  [key: string]: unknown
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // 変更: env.ts（Zod バリデーション済み）から NEXTAUTH_SECRET を参照
  secret: env.NEXTAUTH_SECRET,
  // 変更: 開発環境のみ trustHost を有効化し本番では無効化
  trustHost: env.NODE_ENV !== 'production',
  providers: [
    Credentials({
      credentials: {
        email: { label: 'メールアドレス', type: 'email' },
        password: { label: 'パスワード', type: 'password' },
      },
      authorize: async (credentials) => {
        // 入力値の型バリデーション
        if (
          typeof credentials?.email !== 'string' ||
          typeof credentials?.password !== 'string'
        ) {
          return null
        }

        const user = await findUserByEmail(credentials.email)
        if (!user?.passwordHash) return null

        // 追加: 無効化されたユーザーはログイン不可
        if (user.isActive === false) return null

        // パスワード照合（bcryptjs）
        const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    // JWT にユーザー情報を追加
    jwt({ token, user }) {
      const t = token as JwtToken
      if (user) {
        // 変更: user.id は string 型のため as string キャスト不要
        t.id = user.id
        t.role = user.role
      }
      return token
    },
    // Session にユーザー情報を反映
    session({ session, token }) {
      const t = token as JwtToken
      session.user.id = t.id ?? ''
      session.user.role = t.role ?? 'USER'
      return session
    },
  },
  pages: {
    // ログインページのカスタムパス
    signIn: '/login',
  },
})
