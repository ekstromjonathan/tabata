"use server"

import { redirect } from "next/navigation"

import { getCurrentUser } from "@/lib/auth"
import { isSubscribed, updateUser } from "@/lib/db"
import { appUrl, getStripe, stripeConfigured } from "@/lib/stripe"

export async function startCheckoutAction() {
  const user = await getCurrentUser()
  if (!user) redirect("/signup")
  if (isSubscribed(user)) redirect("/timer")

  if (!stripeConfigured()) {
    await updateUser(user.id, {
      subscriptionStatus: "active",
      currentPeriodEnd: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
    })
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
