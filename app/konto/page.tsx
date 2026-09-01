import { AccountActions } from "@/components/account-actions"
import { SiteHeader } from "@/components/site-header"
import { getCurrentUser } from "@/lib/auth"
import { isSubscribed } from "@/lib/db"
import { PRODUCT } from "@/lib/product-i18n"
import { stripeConfigured } from "@/lib/stripe"
import { redirect } from "next/navigation"

export default async function AccountPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  const copy = PRODUCT.nb
  const subscribed = isSubscribed(user)

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
      <SiteHeader />
      <main className="mt-10">
        <h1 className="text-[32px] font-semibold tracking-tight">{copy.account}</h1>
        <p className="mt-2 text-[15px] text-ink-muted">{user.email}</p>
        <p className="mt-6 text-[15px] text-ink">
          {copy.status}: {subscribed ? copy.active : copy.inactive}
        </p>
        <AccountActions
          copy={copy}
          subscribed={subscribed}
          showStripePortal={Boolean(stripeConfigured() && user.stripeCustomerId)}
        />
      </main>
    </div>
  )
}
