"use client"

import { useEffect } from "react"

export function NativeBootstrap() {
  useEffect(() => {
    void (async () => {
      const { Capacitor } = await import("@capacitor/core")
      if (!Capacitor.isNativePlatform()) return
      const { StatusBar, Style } = await import("@capacitor/status-bar")
      const { SplashScreen } = await import("@capacitor/splash-screen")
      try {
        await StatusBar.setStyle({ style: Style.Dark })
        await StatusBar.setBackgroundColor({ color: "#000000" })
      } catch {
        /* web or unsupported */
      }
      try {
        await SplashScreen.hide()
      } catch {
        /* splash already hidden */
      }
    })()
  }, [])
  return null
}
