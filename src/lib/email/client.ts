import 'server-only' // クライアントバンドルへの混入防止
import { Resend } from 'resend'
import { env } from '@/env'

// Resend クライアント（サーバー専用）
export const resend = new Resend(env.RESEND_API_KEY)
