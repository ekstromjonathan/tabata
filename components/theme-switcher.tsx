"use client"

import { useSyncExternalStore } from "react"

import {
  CustomThemeIcon,
  MoonIcon,
  SunIcon,
} from "@/components/theme-icons"
import {
  THEMES,
  getServerThemeSnapshot,
  getThemeSnapshot,
  saveTheme,
  subscribeTheme,
  type ThemeId,
} from "@/lib/theme"
import { cn } from "@/lib/utils"

const ICONS: Record<ThemeId, typeof SunIcon> = {
  light: SunIcon,
  dark: MoonIcon,
  custom: CustomThemeIcon,
}

export function ThemeSwitcher({
  labels,
  className,
}: {
  labels: {
    theme: string
    light: string
    dark: string
    custom: string
  }
  className?: string
}) {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot
  )

  const names: Record<ThemeId, string> = {
    light: labels.light,
    dark: labels.dark,
    custom: labels.custom,
  }

  return (
    <div
      role="radiogroup"
      aria-label={labels.theme}
      className={cn(
        "flex h-8 items-center rounded-full bg-fill p-0.5",
        className
      )}
    >
      {THEMES.map((id) => {
        const Icon = ICONS[id]
        const selected = theme === id
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={names[id]}
            title={names[id]}
            onClick={() => saveTheme(id)}
            className={cn(
              "grid size-7 place-items-center rounded-full transition-colors",
              selected
                ? "bg-cta text-cta-fg"
                : "text-ink-muted hover:text-ink"
            )}
          >
            <Icon />
          </button>
        )
      })}
    </div>
  )
}
