// 認証関連の定数
export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 100
export const BCRYPT_SALT_ROUNDS = 12

// 認証ルートパス
export const AUTH_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DEFAULT_REDIRECT: '/',
} as const
