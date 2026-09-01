"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSyncExternalStore } from "react"
import Link from "next/link"

import {
  activateDevAccessAction,
  confirmIapAction,
  startCheckoutAction,
} from "@/app/actions/billing"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import {
  getLocaleSnapshot,
  getServerLocaleSnapshot,
  subscribeLocale,
} from "@/lib/i18n"
import { isNativeApp, subscribeNative } from "@/lib/native"
import { PRODUCT } from "@/lib/product-i18n"

export function SubscribePanel({
  mock,
  allowDevUnlock,
}: {
  mock: boolean
  allowDevUnlock: boolean
}) {
  const locale = useSyncExternalStore(
    subscribeLocale,
    getLocaleSnapshot,
    getServerLocaleSnapshot
  )
  const native = useSyncExternalStore(subscribeNative, isNativeApp, () => false)
  const copy = PRODUCT[locale]

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center text-center">
        <h1 className="text-[32px] font-semibold tracking-tight">
          {copy.subscribeTitle}
        </h1>
        <p className="mt-3 max-w-sm text-[16px] leading-relaxed text-ink-muted">
          {native ? copy.nativeSubscribeBody : copy.subscribeBody}
        </p>
        {native ? (
          <NativeCheckout copy={copy} allowDevUnlock={allowDevUnlock} />
        ) : (
          <>
            <p className="mt-8 text-[40px] font-semibold tracking-tight">
              {copy.price}
            </p>
            <p className="mt-1 text-[14px] text-ink-muted">{copy.priceNote}</p>
            <form action={startCheckoutAction} className="mt-10 w-full max-w-[240px]">
              <Button
                type="submit"
                className="h-14 w-full rounded-full bg-cta text-[17px] font-medium text-cta-fg hover:opacity-90"
              >
                {mock ? copy.mockPay : copy.pay}
              </Button>
            </form>
            {mock ? (
              <p className="mt-4 max-w-xs text-[13px] text-ink-faint">
                {copy.mockNote}
              </p>
            ) : null}
          </>
        )}
        <Link href="/" className="mt-8 text-[13px] text-ink-muted hover:text-ink">
          {copy.product}
        </Link>
      </main>
    </div>
  )
}

function NativeCheckout({
  copy,
  allowDevUnlock,
}: {
  copy: (typeof PRODUCT)["nb"]
  allowDevUnlock: boolean
}) {
  const router = useRouter()
  const [price, setPrice] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [storeDown, setStoreDown] = useState(false)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const { loadStoreProduct } = await import("@/lib/store-purchase")
        const product = await loadStoreProduct()
        if (cancelled) return
        setPrice(product?.priceString ?? null)
      } catch {
        if (!cancelled) setStoreDown(true)
      } finally {
        if (!cancelled) setReady(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function buy() {
    setBusy(true)
    setError(null)
    try {
      const { purchaseMonthly } = await import("@/lib/store-purchase")
      const payload = await purchaseMonthly()
      const result = await confirmIapAction(payload)
      if (result && "error" in result && result.error) {
        setError(result.error)
        return
      }
      router.push("/timer")
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : ""
      if (/cancel/i.test(message)) return
      setError(copy.iapError)
    } finally {
      setBusy(false)
    }
  }

  async function restore() {
    setBusy(true)
    setError(null)
    try {
      const { restoreMonthly } = await import("@/lib/store-purchase")
      const payload = await restoreMonthly()
      if (!payload) {
        setError(copy.restoreNone)
        return
      }
      const result = await confirmIapAction(payload)
      if (result && "error" in result && result.error) {
        setError(result.error)
        return
      }
      router.push("/timer")
      router.refresh()
    } catch {
      setError(copy.restoreNone)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <p className="mt-8 text-[40px] font-semibold tracking-tight">
        {price ?? (ready ? copy.price : "…")}
      </p>
      <p className="mt-1 text-[14px] text-ink-muted">{copy.priceNote}</p>
      <p className="mt-4 max-w-xs text-[12px] leading-relaxed text-ink-faint">
        {copy.appleLegal}
      </p>
      {storeDown ? (
        <p className="mt-6 max-w-xs text-[13px] text-ink-muted">
          {copy.storeUnavailable}
        </p>
      ) : (
        <Button
          type="button"
          disabled={busy || !ready}
          onClick={() => void buy()}
          className="mt-10 h-14 w-full max-w-[240px] rounded-full bg-cta text-[17px] font-medium text-cta-fg hover:opacity-90 disabled:opacity-50"
        >
          {busy ? copy.working : copy.pay}
        </Button>
      )}
      <button
        type="button"
        disabled={busy}
        onClick={() => void restore()}
        className="mt-4 text-[13px] text-ink-muted hover:text-ink disabled:opacity-50"
      >
        {copy.restore}
      </button>
      {allowDevUnlock ? (
        <form action={activateDevAccessAction} className="mt-6 w-full max-w-[240px]">
          <Button
            type="submit"
            variant="ghost"
            className="h-12 w-full rounded-full text-ink-muted hover:bg-fill hover:text-ink"
          >
            {copy.mockPay}
          </Button>
        </form>
      ) : null}
      {error ? (
        <p className="mt-4 max-w-xs text-[13px] text-red-400">{error}</p>
      ) : null}
    </>
  )
}
