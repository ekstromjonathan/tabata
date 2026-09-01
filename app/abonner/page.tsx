import { redirect } from "next/navigation"

import { SubscribePanel } from "@/components/subscribe-panel"
import { getCurrentUser } from "@/lib/auth"
import { isSubscribed } from "@/lib/db"
import { stripeConfigured } from "@/lib/stripe"

export default async function SubscribePage() {
  const user = await getCurrentUser()
  if (!user) redirect("/signup")
  if (isSubscribed(user)) redirect("/timer")
  return <SubscribePanel mock={!stripeConfigured()} />
}
