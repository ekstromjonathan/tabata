import Stripe from "stripe"

export const PRICE_NOK = 19
export const PRICE_ORE = 1900

export function stripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID)
}

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  return new Stripe(key)
}

export function appUrl() {
  return process.env.APP_URL ?? "http://127.0.0.1:43173"
}
