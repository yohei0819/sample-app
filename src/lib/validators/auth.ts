// 認証フォームの Zod バリデーションスキーマ
import { z } from 'zod'
import { PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH } from '@/constants/auth'

// ログインスキーマ
export const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください'),
})

// 会員登録スキーマ
export const registerSchema = z.object({
  name: z
    .string()
    .min(1, '名前を入力してください')
    .max(50, '名前は50文字以内で入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `パスワードは${PASSWORD_MIN_LENGTH}文字以上で入力してください`)
    .max(PASSWORD_MAX_LENGTH, `パスワードは${PASSWORD_MAX_LENGTH}文字以内で入力してください`),
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>

// 追加 (#129): パスワードリセット要求スキーマ
export const forgotPasswordSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
})
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

// 追加 (#129): パスワード再設定スキーマ
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'トークンが必要です'),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `パスワードは${PASSWORD_MIN_LENGTH}文字以上で入力してください`)
    .max(PASSWORD_MAX_LENGTH, `パスワードは${PASSWORD_MAX_LENGTH}文字以内で入力してください`),
})
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
