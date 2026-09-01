"use client"

import Link from "next/link"
import { useSyncExternalStore } from "react"

import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeSwitcher } from "@/components/theme-switcher"
import {
  MESSAGES,
  getLocaleSnapshot,
  getServerLocaleSnapshot,
  saveLocale,
  subscribeLocale,
} from "@/lib/i18n"
import { PRODUCT } from "@/lib/product-i18n"

export function SiteHeader({
  right,
}: {
  right?: React.ReactNode
}) {
  const locale = useSyncExternalStore(
    subscribeLocale,
    getLocaleSnapshot,
    getServerLocaleSnapshot
  )
  const copy = PRODUCT[locale]
  const timerCopy = MESSAGES[locale]

  return (
    <header className="relative flex items-center justify-between px-1 py-2">
      <Link href="/" className="text-[15px] font-medium tracking-tight text-ink">
        {copy.product}
      </Link>
      <div className="flex items-center gap-2">
        {right}
        <ThemeSwitcher
          labels={{
            theme: timerCopy.theme,
            light: timerCopy.themeLight,
            dark: timerCopy.themeDark,
            custom: timerCopy.themeCustom,
          }}
        />
        <LanguageSwitcher
          locale={locale}
          copy={timerCopy}
          onChange={saveLocale}
        />
      </div>
    </header>
  )
}
