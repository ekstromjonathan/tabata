"use client"

import { useSyncExternalStore } from "react"
import Link from "next/link"

import { startCheckoutAction } from "@/app/actions/billing"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import {
  getLocaleSnapshot,
  getServerLocaleSnapshot,
  subscribeLocale,
} from "@/lib/i18n"
import { PRODUCT } from "@/lib/product-i18n"

export function SubscribePanel({ mock }: { mock: boolean }) {
  const locale = useSyncExternalStore(
    subscribeLocale,
    getLocaleSnapshot,
    getServerLocaleSnapshot
  )
  const copy = PRODUCT[locale]

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-8">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center text-center">
        <h1 className="text-[32px] font-semibold tracking-tight">
          {copy.subscribeTitle}
        </h1>
        <p className="mt-3 max-w-sm text-[16px] leading-relaxed text-white/55">
          {copy.subscribeBody}
        </p>
        <p className="mt-8 text-[40px] font-semibold tracking-tight">{copy.price}</p>
        <p className="mt-1 text-[14px] text-white/45">{copy.priceNote}</p>
        <form action={startCheckoutAction} className="mt-10 w-full max-w-[240px]">
          <Button
            type="submit"
            className="h-14 w-full rounded-full bg-white text-[17px] font-medium text-black hover:bg-white/90"
          >
            {mock ? copy.mockPay : copy.pay}
          </Button>
        </form>
        {mock ? (
          <p className="mt-4 max-w-xs text-[13px] text-white/35">{copy.mockNote}</p>
        ) : null}
        <Link href="/" className="mt-8 text-[13px] text-white/40 hover:text-white">
          {copy.product}
        </Link>
      </main>
    </div>
  )
}
