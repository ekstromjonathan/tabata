import { getCurrentUser } from "@/lib/auth"
import { findUserById, isSubscribed, updateUser } from "@/lib/db"
import { getStripe } from "@/lib/stripe"
import { redirect } from "next/navigation"

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  const { session_id: sessionId } = await searchParams
  const stripe = getStripe()
  if (stripe && sessionId) {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (session.customer && session.subscription) {
      const customerId =
        typeof session.customer === "string"
          ? session.customer
          : session.customer.id
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription.id
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      await updateUser(user.id, {
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        subscriptionStatus: subscription.status,
        currentPeriodEnd: subscription.items.data[0]?.current_period_end ?? null,
      })
    }
  }
  const fresh = (await findUserById(user.id)) ?? user
  redirect(isSubscribed(fresh) ? "/timer" : "/abonner")
}
