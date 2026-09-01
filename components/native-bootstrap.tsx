"use client"

import { useEffect } from "react"

export function NativeBootstrap() {
  useEffect(() => {
    void (async () => {
      const { Capacitor } = await import("@capacitor/core")
      if (!Capacitor.isNativePlatform()) return
      const { SplashScreen } = await import("@capacitor/splash-screen")
      try {
        await SplashScreen.hide()
      } catch {
        /* splash already hidden */
      }
    })()
  }, [])
  return null
}
