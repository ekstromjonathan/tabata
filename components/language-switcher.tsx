"use client"

import { useEffect, useId, useRef, useState } from "react"
import { Languages } from "lucide-react"

import { Button } from "@/components/ui/button"
import { LOCALES, type Locale, type Messages } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export function LanguageSwitcher({
  locale,
  copy,
  onChange,
}: {
  locale: Locale
  copy: Messages
  onChange: (locale: Locale) => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const current = LOCALES.find((item) => item.id === locale) ?? LOCALES[0]

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false)
    }

    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className="absolute top-0 right-0 z-30">
      <Button
        type="button"
        variant="ghost"
        aria-label={copy.language}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "h-8 gap-1.5 rounded-full bg-white/6 px-2.5 text-[12px] font-medium tracking-[0.08em]",
          "text-white/65 hover:bg-white/10 hover:text-white"
        )}
      >
        <Languages className="size-3.5 opacity-80" />
        {current.code}
      </Button>
      {open ? (
        <div
          id={menuId}
          role="listbox"
          aria-label={copy.language}
          className="absolute top-[calc(100%+8px)] right-0 min-w-[9.5rem] overflow-hidden rounded-2xl bg-[#1c1c1e] py-1 shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
        >
          {LOCALES.map((item) => {
            const selected = item.id === locale
            return (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-selected={selected}
                className={cn(
                  "flex w-full items-center justify-between px-3.5 py-2.5 text-left text-[14px]",
                  selected ? "text-white" : "text-white/55 hover:bg-white/6 hover:text-white"
                )}
                onClick={() => {
                  onChange(item.id)
                  setOpen(false)
                }}
              >
                <span>{item.name}</span>
                <span className="text-[11px] tracking-[0.12em] text-white/35">
                  {item.code}
                </span>
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
