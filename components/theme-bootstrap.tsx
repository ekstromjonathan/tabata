"use client"

import { useEffect } from "react"
import { useSyncExternalStore } from "react"

import {
  THEME_CANVAS,
  applyTheme,
  getServerThemeSnapshot,
  getThemeSnapshot,
  subscribeTheme,
} from "@/lib/theme"

export function ThemeBootstrap() {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot
  )

  useEffect(() => {
    applyTheme(theme)
    void (async () => {
      try {
        const { Capacitor } = await import("@capacitor/core")
        if (!Capacitor.isNativePlatform()) return
        const { StatusBar, Style } = await import("@capacitor/status-bar")
        await StatusBar.setStyle({
          style: theme === "light" ? Style.Light : Style.Dark,
        })
        await StatusBar.setBackgroundColor({ color: THEME_CANVAS[theme] })
      } catch {
        /* web or unsupported */
      }
    })()
  }, [theme])

  return null
}
