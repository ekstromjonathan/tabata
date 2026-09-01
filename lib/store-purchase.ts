"use client"

import { Capacitor } from "@capacitor/core"
import {
  NativePurchases,
  PURCHASE_TYPE,
  type Transaction,
} from "@capgo/native-purchases"

import {
  IAP_ANDROID_PLAN_ID,
  IAP_PRODUCT_ID,
  type IapConfirmPayload,
  type IapPlatform,
} from "@/lib/iap"

function platform(): IapPlatform {
  return Capacitor.getPlatform() === "android" ? "android" : "ios"
}

export async function loadStoreProduct() {
  const { products } = await NativePurchases.getProducts({
    productIdentifiers: [IAP_PRODUCT_ID],
    productType: PURCHASE_TYPE.SUBS,
  })
  return (
    products.find((item) => item.identifier === IAP_PRODUCT_ID) ??
    products.find((item) => item.planIdentifier === IAP_PRODUCT_ID) ??
    products[0] ??
    null
  )
}

export async function purchaseMonthly(): Promise<IapConfirmPayload> {
  const transaction = await NativePurchases.purchaseProduct({
    productIdentifier: IAP_PRODUCT_ID,
    productType: PURCHASE_TYPE.SUBS,
    planIdentifier: IAP_ANDROID_PLAN_ID,
    quantity: 1,
  })
  return toPayload(transaction, platform())
}

export async function restoreMonthly(): Promise<IapConfirmPayload | null> {
  await NativePurchases.restorePurchases()
  const { purchases } = await NativePurchases.getPurchases({
    productType: PURCHASE_TYPE.SUBS,
    onlyCurrentEntitlements: true,
  })
  const match =
    purchases.find(
      (item) =>
        item.productIdentifier === IAP_PRODUCT_ID && item.isActive !== false
    ) ?? purchases.find((item) => item.isActive !== false)
  if (!match) return null
  return toPayload(match, platform())
}

export async function openNativeSubscriptions() {
  await NativePurchases.manageSubscriptions()
}

function toPayload(tx: Transaction, nativePlatform: IapPlatform): IapConfirmPayload {
  const expirationMs = tx.expirationDate
    ? Date.parse(tx.expirationDate)
    : null
  return {
    platform: nativePlatform,
    productId: tx.productIdentifier || IAP_PRODUCT_ID,
    transactionId: tx.transactionId,
    originalTransactionId: tx.transactionId,
    purchaseToken: tx.purchaseToken ?? null,
    receipt: tx.receipt ?? null,
    expirationMs:
      expirationMs && !Number.isNaN(expirationMs) ? expirationMs : null,
  }
}
