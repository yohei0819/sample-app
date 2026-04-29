// NextAuth v5（Auth.js）設定
// 変更: server-only でクライアントバンドルへの混入を防止
import 'server-only'
import bcrypt from 'bcryptjs'
import NextAuth, { type DefaultSession } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google' // 追加 (#105)
import { env } from '@/env'
import { findUserByEmail, createUser } from '@/lib/db/users' // 変更 (#105): createUser 追加
import { prisma } from '@/lib/db/prisma' // 追加 (#120)

// Session 型拡張：id・role フィールドを追加
declare module 'next-auth' {
  interface User {
    role: string
  }
  interface Session {
    user: {
      id: string
      role: string
      isEmailVerified: boolean // 追加 (#120)
    } & DefaultSession['user']
  }
}

// 変更: next-auth v5 beta では next-auth/jwt モジュールが未公開のため
// JWT カスタムフィールドは string インデックスで管理する
type JwtToken = {
  id?: string
  role?: string
  isEmailVerified?: boolean // 追加 (#120)
  [key: string]: unknown
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // 変更: env.ts（Zod バリデーション済み）から NEXTAUTH_SECRET を参照
  secret: env.NEXTAUTH_SECRET,
  // 変更: 開発環境のみ trustHost を有効化し本番では無効化
  trustHost: env.NODE_ENV !== 'production',
  providers: [
    // 追加 (#105): Google OAuth プロバイダー（環境変数が設定されている時のみ有効）
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
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
    // 追加 (#105): Google OAuth で初回ログイン時にユーザーを自動作成・既存ユーザーは email で連携
    async signIn({ user, account }) {
      if (account?.provider !== 'google') return true
      if (!user.email) return false

      const existing = await findUserByEmail(user.email)
      if (existing) {
        // 既存ユーザーが無効化されている場合はログイン拒否
        if (existing.isActive === false) return false
        // 追加 (#120): Google OAuth で認証済みなら emailVerifiedAt を自動セット
        if (!existing.emailVerifiedAt) {
          await prisma.user.update({
            where: { id: existing.id },
            data: { emailVerifiedAt: new Date() },
          })
        }
        // 既存ユーザーの id/role を user オブジェクトに反映（jwt callback へ伝播）
        user.id = existing.id
        user.role = existing.role
        return true
      }

      // 新規 Google ユーザー：パスワードなしで作成
      const created = await createUser({
        email: user.email,
        name: user.name ?? null,
        // passwordHash 未設定（Google 認証専用）
        emailVerifiedAt: new Date(), // 追加 (#120): Google OAuth は確認済みとみなす
      })
      user.id = created.id
      user.role = created.role
      return true
    },
    // JWT にユーザー情報を追加
    jwt({ token, user, trigger }) {
      const t = token as JwtToken
      if (user) {
        // 変更: user.id は string 型のため as string キャスト不要
        t.id = user.id
        t.role = user.role
      }
      // 追加 (#120): セッション初回 or 更新トリガー時に DB の emailVerifiedAt を反映
      if (trigger === 'update' || (user && t.id)) {
        // 非同期での読み込みは jwt() で許容される
        return prisma.user
          .findUnique({ where: { id: t.id }, select: { emailVerifiedAt: true } })
          .then((u) => {
            t.isEmailVerified = Boolean(u?.emailVerifiedAt)
            return token
          })
          .catch(() => token)
      }
      return token
    },
    // Session にユーザー情報を反映
    session({ session, token }) {
      const t = token as JwtToken
      session.user.id = t.id ?? ''
      session.user.role = t.role ?? 'USER'
      session.user.isEmailVerified = Boolean(t.isEmailVerified) // 追加 (#120)
      return session
    },
  },
  pages: {
    // ログインページのカスタムパス
    signIn: '/login',
  },
})
