import Link from "next/link"

import { logoutAction } from "@/app/actions/auth"
import { openPortalAction } from "@/app/actions/billing"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
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
    <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-8">
      <SiteHeader />
      <main className="mt-10">
        <h1 className="text-[32px] font-semibold tracking-tight">{copy.account}</h1>
        <p className="mt-2 text-[15px] text-white/50">{user.email}</p>
        <p className="mt-6 text-[15px] text-white/70">
          {copy.status}: {subscribed ? copy.active : copy.inactive}
        </p>
        <div className="mt-10 flex flex-col gap-3">
          {subscribed ? (
            <Link
              href="/timer"
              className="inline-flex h-14 items-center justify-center rounded-full bg-white text-[17px] font-medium text-black hover:bg-white/90"
            >
              {copy.openTimer}
            </Link>
          ) : (
            <Link
              href="/abonner"
              className="inline-flex h-14 items-center justify-center rounded-full bg-white text-[17px] font-medium text-black hover:bg-white/90"
            >
              {copy.cta}
            </Link>
          )}
          {stripeConfigured() && user.stripeCustomerId ? (
            <form action={openPortalAction}>
              <Button
                type="submit"
                variant="ghost"
                className="h-12 w-full rounded-full text-white/70 hover:bg-white/8 hover:text-white"
              >
                {copy.manageBilling}
              </Button>
            </form>
          ) : null}
          <form action={logoutAction}>
            <Button
              type="submit"
              variant="ghost"
              className="h-12 w-full rounded-full text-white/45 hover:bg-white/8 hover:text-white"
            >
              {copy.logout}
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
