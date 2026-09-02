"use client"

import Link from "next/link"
import { useSyncExternalStore } from "react"

import { SiteHeader } from "@/components/site-header"
import {
  getLocaleSnapshot,
  getServerLocaleSnapshot,
  subscribeLocale,
} from "@/lib/i18n"
import { PRODUCT } from "@/lib/product-i18n"

export function LandingPage() {
  const locale = useSyncExternalStore(
    subscribeLocale,
    getLocaleSnapshot,
    getServerLocaleSnapshot
  )
  const copy = PRODUCT[locale]

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,var(--glow),transparent_55%)]"
      />
      <SiteHeader
        right={
          <Link
            href="/login"
            className="text-[13px] text-ink-muted hover:text-ink"
          >
            {copy.login}
          </Link>
        }
      />

      <main className="relative flex flex-1 flex-col items-center justify-center text-center">
        <p className="text-[12px] font-medium tracking-[0.22em] text-ink-faint uppercase">
          {copy.product}
        </p>
        <h1 className="mt-4 max-w-sm text-[40px] leading-[1.05] font-semibold tracking-tight sm:text-[48px]">
          {copy.tagline}
        </h1>
        <p className="mt-5 max-w-sm text-[17px] leading-relaxed text-ink-muted">
          {copy.pitch}
        </p>

        <div className="mt-10 w-full max-w-xs rounded-[22px] bg-fill px-6 py-7">
          <p className="text-[40px] font-semibold tracking-tight">{copy.price}</p>
          <p className="mt-1 text-[14px] text-ink-muted">{copy.priceNote}</p>
        </div>

        <ul className="mt-8 space-y-2 text-[15px] text-ink-muted">
          <li>{copy.feature1}</li>
          <li>{copy.feature2}</li>
          <li>{copy.feature3}</li>
          <li>{copy.feature4}</li>
        </ul>

        <Link
          href="/tabata"
          className="mt-10 inline-flex h-14 w-full max-w-[220px] items-center justify-center rounded-full bg-cta text-[17px] font-medium text-cta-fg hover:opacity-90"
        >
          {copy.tryNow}
        </Link>
        <p className="mt-3 text-[13px] text-ink-faint">{copy.tryNote}</p>
        <Link
          href="/signup"
          className="mt-4 text-[14px] text-ink-muted hover:text-ink"
        >
          {copy.cta}
        </Link>
        <p className="mt-6 max-w-xs text-[13px] text-ink-faint">
          {copy.downloadStores}
        </p>
      </main>

      <footer className="relative flex items-center justify-between pt-8 text-[12px] text-ink-faint">
        <p>{copy.footer}</p>
        <div className="flex gap-4">
          <Link href="/personvern" className="hover:text-ink-muted">
            {copy.privacy}
          </Link>
          <Link href="/vilkar" className="hover:text-ink-muted">
            {copy.terms}
          </Link>
        </div>
      </footer>
    </div>
  )
}
