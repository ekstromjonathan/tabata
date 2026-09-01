import { NextResponse } from "next/server"
import type Stripe from "stripe"

import {
  findUserByCustomerId,
  findUserById,
  updateUser,
} from "@/lib/db"
import { getStripe } from "@/lib/stripe"

export const runtime = "nodejs"

async function syncFromSubscription(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id
  const userId = subscription.metadata?.userId
  const user =
    (userId ? await findUserById(userId) : null) ??
    (await findUserByCustomerId(customerId))
  if (!user) return
  const periodEnd = subscription.items.data[0]?.current_period_end ?? null
  await updateUser(user.id, {
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    subscriptionStatus: subscription.status,
    currentPeriodEnd: periodEnd,
  })
}

export async function POST(request: Request) {
  const stripe = getStripe()
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripe || !secret) {
    return NextResponse.json({ received: true, mock: true })
  }

  const body = await request.text()
  const signature = request.headers.get("stripe-signature")
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret)
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.client_reference_id ?? session.metadata?.userId
    if (userId && session.customer && session.subscription) {
      const customerId =
        typeof session.customer === "string"
          ? session.customer
          : session.customer.id
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription.id
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      const periodEnd = subscription.items.data[0]?.current_period_end ?? null
      await updateUser(userId, {
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        subscriptionStatus: subscription.status,
        currentPeriodEnd: periodEnd,
      })
    }
  }

  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.deleted"
  ) {
    await syncFromSubscription(event.data.object as Stripe.Subscription)
  }

  return NextResponse.json({ received: true })
}
