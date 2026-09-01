export function isNativeApp() {
  if (typeof window === "undefined") return false
  const capacitor = (
    window as unknown as {
      Capacitor?: { isNativePlatform?: () => boolean }
    }
  ).Capacitor
  return Boolean(capacitor?.isNativePlatform?.())
}

export function subscribeNative(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {}
  onStoreChange()
  return () => {}
}
