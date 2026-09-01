"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSyncExternalStore } from "react"
import Link from "next/link"

import { deleteAccountAction, logoutAction } from "@/app/actions/auth"
import { openPortalAction } from "@/app/actions/billing"
import { Button } from "@/components/ui/button"
import { isNativeApp, subscribeNative } from "@/lib/native"
import type { ProductCopy } from "@/lib/product-i18n"

export function AccountActions({
  copy,
  subscribed,
  showStripePortal,
}: {
  copy: ProductCopy
  subscribed: boolean
  showStripePortal: boolean
}) {
  const router = useRouter()
  const native = useSyncExternalStore(subscribeNative, isNativeApp, () => false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function restore() {
    setBusy(true)
    setRestoreMessage(null)
    try {
      const { restoreMonthly } = await import("@/lib/store-purchase")
      const { confirmIapAction } = await import("@/app/actions/billing")
      const payload = await restoreMonthly()
      if (!payload) {
        setRestoreMessage(copy.restoreNone)
        return
      }
      const result = await confirmIapAction(payload)
      if (result && "error" in result && result.error) {
        setRestoreMessage(result.error)
        return
      }
      setRestoreMessage(copy.restoreOk)
      router.push("/timer")
      router.refresh()
    } catch {
      setRestoreMessage(copy.restoreNone)
    } finally {
      setBusy(false)
    }
  }

  async function manageStore() {
    try {
      const { openNativeSubscriptions } = await import("@/lib/store-purchase")
      await openNativeSubscriptions()
    } catch {
      setRestoreMessage(copy.iapError)
    }
  }

  return (
    <div className="mt-10 flex flex-col gap-3">
      {subscribed ? (
        <Link
          href="/timer"
          className="inline-flex h-14 items-center justify-center rounded-full bg-cta text-[17px] font-medium text-cta-fg hover:opacity-90"
        >
          {copy.openTimer}
        </Link>
      ) : (
        <Link
          href="/abonner"
          className="inline-flex h-14 items-center justify-center rounded-full bg-cta text-[17px] font-medium text-cta-fg hover:opacity-90"
        >
          {copy.cta}
        </Link>
      )}
      {showStripePortal && !native ? (
        <form action={openPortalAction}>
          <Button
            type="submit"
            variant="ghost"
            className="h-12 w-full rounded-full text-ink-muted hover:bg-fill hover:text-ink"
          >
            {copy.manageBilling}
          </Button>
        </form>
      ) : null}
      {native ? (
        <>
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={() => void manageStore()}
            className="h-12 w-full rounded-full text-ink-muted hover:bg-fill hover:text-ink"
          >
            {copy.manageStore}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={() => void restore()}
            className="h-12 w-full rounded-full text-ink-muted hover:bg-fill hover:text-ink"
          >
            {copy.restore}
          </Button>
        </>
      ) : null}
      <form action={logoutAction}>
        <Button
          type="submit"
          variant="ghost"
          className="h-12 w-full rounded-full text-ink-muted hover:bg-fill hover:text-ink"
        >
          {copy.logout}
        </Button>
      </form>
      {confirmDelete ? (
        <form action={deleteAccountAction}>
          <Button
            type="submit"
            variant="ghost"
            className="h-12 w-full rounded-full text-red-400 hover:bg-fill hover:text-red-300"
          >
            {copy.deleteForever}
          </Button>
        </form>
      ) : (
        <Button
          type="button"
          variant="ghost"
          onClick={() => setConfirmDelete(true)}
          className="h-12 w-full rounded-full text-ink-faint hover:bg-fill hover:text-red-300"
        >
          {copy.deleteAccount}
        </Button>
      )}
      {restoreMessage ? (
        <p className="text-center text-[13px] text-ink-muted">{restoreMessage}</p>
      ) : null}
    </div>
  )
}
