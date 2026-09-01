export type ThemeId = "light" | "dark" | "custom"

export const THEMES: ThemeId[] = ["light", "dark", "custom"]

export const THEME_CANVAS: Record<ThemeId, string> = {
  light: "#f5f5f7",
  dark: "#000000",
  custom: "#140e0a",
}

const STORAGE_KEY = "tabata-theme"
const listeners = new Set<() => void>()
let memory: ThemeId | null = null

function isTheme(value: string | null): value is ThemeId {
  return value === "light" || value === "dark" || value === "custom"
}

export function applyTheme(theme: ThemeId) {
  if (typeof document === "undefined") return
  const root = document.documentElement
  root.dataset.theme = theme
  root.classList.toggle("dark", theme !== "light")
  const meta = document.querySelector('meta[name="theme-color"]')
  meta?.setAttribute("content", THEME_CANVAS[theme])
}

export function subscribeTheme(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getThemeSnapshot(): ThemeId {
  if (memory) return memory
  if (typeof window === "undefined") return "dark"
  const stored = window.localStorage.getItem(STORAGE_KEY)
  memory = isTheme(stored) ? stored : "dark"
  return memory
}

export function getServerThemeSnapshot(): ThemeId {
  return "dark"
}

export function saveTheme(next: ThemeId) {
  memory = next
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, next)
    applyTheme(next)
  }
  listeners.forEach((listener) => listener())
}
