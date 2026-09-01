export const IAP_PRODUCT_ID = "tabata_monthly"
export const IAP_ANDROID_PLAN_ID = "monthly"
export const IAP_BUNDLE_ID = "com.ekstromjonathan.tabata"

export type IapPlatform = "ios" | "android"

export type IapConfirmPayload = {
  platform: IapPlatform
  productId: string
  transactionId: string
  originalTransactionId?: string | null
  purchaseToken?: string | null
  receipt?: string | null
  expirationMs?: number | null
}
