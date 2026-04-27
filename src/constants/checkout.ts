// チェックアウト関連の定数
export const CHECKOUT_SUCCESS_PATH = '/checkout/success'
export const CHECKOUT_CANCEL_PATH = '/cart'

// 配送先住所の型
export type ShippingAddress = {
  postalCode: string
  prefecture: string
  city: string
  addressLine1: string
  addressLine2?: string
  name: string
  phone: string
}
