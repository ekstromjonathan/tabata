"use server"

import { redirect } from "next/navigation"

import { getCurrentUser } from "@/lib/auth"
import {
  findUserByIapOriginalId,
  isSubscribed,
  updateUser,
} from "@/lib/db"
import {
  IAP_ANDROID_PLAN_ID,
  IAP_PRODUCT_ID,
  type IapConfirmPayload,
} from "@/lib/iap"
import { appUrl, getStripe, stripeConfigured } from "@/lib/stripe"

export async function startCheckoutAction() {
  const user = await getCurrentUser()
  if (!user) redirect("/signup")
  if (isSubscribed(user)) redirect("/timer")

  if (!stripeConfigured()) {
    await activateDevAccess(user.id)
    redirect("/timer")
  }

  const stripe = getStripe()
  if (!stripe) redirect("/abonner")

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: user.stripeCustomerId ?? undefined,
    customer_email: user.stripeCustomerId ? undefined : user.email,
    client_reference_id: user.id,
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    success_url: `${appUrl()}/suksess?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl()}/abonner`,
    allow_promotion_codes: true,
    metadata: { userId: user.id },
  })

  if (!session.url) redirect("/abonner")
  redirect(session.url)
}

export async function activateDevAccessAction() {
  const user = await getCurrentUser()
  if (!user) redirect("/signup")
  if (isSubscribed(user)) redirect("/timer")
  if (process.env.NODE_ENV === "production") redirect("/abonner")
  await activateDevAccess(user.id)
  redirect("/timer")
}

async function activateDevAccess(userId: string) {
  await updateUser(userId, {
    billingProvider: "mock",
    subscriptionStatus: "active",
    currentPeriodEnd: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
  })
}

export async function openPortalAction() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (!stripeConfigured() || !user.stripeCustomerId) redirect("/konto")
  const stripe = getStripe()
  if (!stripe) redirect("/konto")
  const portal = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${appUrl()}/konto`,
  })
  redirect(portal.url)
}

export async function confirmIapAction(payload: IapConfirmPayload) {
  const user = await getCurrentUser()
  if (!user) return { error: "Du må være innlogget." }

  if (!payload || typeof payload !== "object") {
    return { error: "Ugyldig kjøp." }
  }

  const productId = String(payload.productId ?? "")
  if (productId !== IAP_PRODUCT_ID && productId !== IAP_ANDROID_PLAN_ID) {
    return { error: "Ukjent produkt." }
  }

  const platform = payload.platform === "android" ? "android" : "ios"
  const transactionId = String(payload.transactionId ?? "").trim()
  if (!transactionId) return { error: "Mangler transaksjon." }

  const originalId = String(
    payload.originalTransactionId || payload.purchaseToken || transactionId
  ).trim()

  const owner = await findUserByIapOriginalId(originalId)
  if (owner && owner.id !== user.id) {
    return {
      error: "Dette kjøpet er knyttet til en annen konto. Logg inn der.",
    }
  }

  const verified = await verifyIapReceipt(payload)
  if (!verified.ok) return { error: verified.error }

  const periodEnd =
    verified.expiresAt ??
    (payload.expirationMs
      ? Math.floor(payload.expirationMs / 1000)
      : Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30)

  await updateUser(user.id, {
    billingProvider: platform === "ios" ? "apple" : "google",
    iapOriginalId: originalId,
    subscriptionStatus: "active",
    currentPeriodEnd: periodEnd,
  })

  return { ok: true as const }
}

async function verifyIapReceipt(
  payload: IapConfirmPayload
): Promise<{ ok: true; expiresAt?: number } | { ok: false; error: string }> {
  const secret = process.env.APPLE_SHARED_SECRET
  if (payload.platform === "ios" && secret && payload.receipt) {
    const result = await verifyAppleReceipt(payload.receipt, secret)
    if (!result.ok) return result
    return { ok: true, expiresAt: result.expiresAt }
  }
  return { ok: true }
}

async function verifyAppleReceipt(receipt: string, password: string) {
  for (const host of [
    "https://buy.itunes.apple.com/verifyReceipt",
    "https://sandbox.itunes.apple.com/verifyReceipt",
  ] as const) {
    const response = await fetch(host, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        "receipt-data": receipt,
        password,
        "exclude-old-transactions": true,
      }),
    })
    if (!response.ok) continue
    const data = (await response.json()) as {
      status?: number
      latest_receipt_info?: Array<{
        product_id?: string
        expires_date_ms?: string
      }>
    }
    if (data.status === 21007) continue
    if (data.status !== 0) {
      return { ok: false as const, error: "Kjøpet kunne ikke bekreftes hos Apple." }
    }
    const latest = data.latest_receipt_info?.at(-1)
    const expiresAt = latest?.expires_date_ms
      ? Math.floor(Number(latest.expires_date_ms) / 1000)
      : undefined
    return { ok: true as const, expiresAt }
  }
  return { ok: false as const, error: "Kjøpet kunne ikke bekreftes hos Apple." }
}
