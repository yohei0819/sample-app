// NextAuth v5（Auth.js）設定
import bcrypt from 'bcryptjs'
import NextAuth, { type DefaultSession } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
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

export const { handlers, auth, signIn, signOut } = NextAuth({
  // NEXTAUTH_SECRET を明示的に渡す
  secret: process.env.NEXTAUTH_SECRET,
  // 開発環境で HTTPS 必須チェックをスキップ
  trustHost: true,
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
      if (user) {
        token['id'] = user.id as string
        token['role'] = user.role
      }
      return token
    },
    // Session にユーザー情報を反映
    session({ session, token }) {
      session.user.id = token['id'] as string
      session.user.role = token['role'] as string
      return session
    },
  },
  pages: {
    // ログインページのカスタムパス
    signIn: '/login',
  },
})
