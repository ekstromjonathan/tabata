"use client"

import { useActionState } from "react"
import { useSyncExternalStore } from "react"
import Link from "next/link"

import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginAction, signupAction } from "@/app/actions/auth"
import {
  getLocaleSnapshot,
  getServerLocaleSnapshot,
  subscribeLocale,
} from "@/lib/i18n"
import { PRODUCT } from "@/lib/product-i18n"

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const locale = useSyncExternalStore(
    subscribeLocale,
    getLocaleSnapshot,
    getServerLocaleSnapshot
  )
  const copy = PRODUCT[locale]
  const action = mode === "signup" ? signupAction : loginAction
  const [state, formAction, pending] = useActionState(action, null)

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-8">
      <SiteHeader />
      <main className="flex flex-1 flex-col justify-center">
        <h1 className="text-[32px] font-semibold tracking-tight">
          {mode === "signup" ? copy.signup : copy.login}
        </h1>
        <form action={formAction} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{copy.email}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="h-12 rounded-xl bg-fill text-ink"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{copy.password}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={
                mode === "signup" ? "new-password" : "current-password"
              }
              minLength={8}
              required
              className="h-12 rounded-xl bg-fill text-ink"
            />
          </div>
          {state?.error ? (
            <p className="text-[14px] text-red-400">{state.error}</p>
          ) : null}
          <Button
            type="submit"
            disabled={pending}
            className="h-14 w-full rounded-full bg-cta text-[17px] font-medium text-cta-fg hover:opacity-90"
          >
            {mode === "signup" ? copy.signup : copy.login}
          </Button>
        </form>
        <p className="mt-6 text-center text-[14px] text-ink-muted">
          {mode === "signup" ? copy.haveAccount : copy.needAccount}{" "}
          <Link
            href={mode === "signup" ? "/login" : "/signup"}
            className="text-ink hover:underline"
          >
            {mode === "signup" ? copy.login : copy.signup}
          </Link>
        </p>
      </main>
    </div>
  )
}
