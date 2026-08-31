"use client"

import { useRef, useState } from "react"
import { Minus, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type StepperRowProps = {
  label: string
  hint?: string
  value: number
  suffix?: string
  min: number
  max: number
  decreaseLabel: string
  increaseLabel: string
  onChange: (value: number) => void
}

export function StepperRow({
  label,
  hint,
  value,
  suffix = "",
  min,
  max,
  decreaseLabel,
  increaseLabel,
  onChange,
}: StepperRowProps) {
  const delayRef = useRef<number | null>(null)
  const intervalRef = useRef<number | null>(null)
  const [draft, setDraft] = useState<string | null>(null)

  function clearHold() {
    if (delayRef.current) window.clearTimeout(delayRef.current)
    if (intervalRef.current) window.clearInterval(intervalRef.current)
    delayRef.current = null
    intervalRef.current = null
  }

  function commit(next: number) {
    onChange(Math.min(max, Math.max(min, Math.round(next))))
  }

  function hold(delta: number) {
    let current = value
    const apply = () => {
      current = Math.min(max, Math.max(min, current + delta))
      onChange(current)
    }
    apply()
    delayRef.current = window.setTimeout(() => {
      intervalRef.current = window.setInterval(apply, 70)
    }, 380)
  }

  const shown = draft ?? String(value)

  return (
    <div className="flex items-center justify-between gap-3 px-5 py-3.5">
      <div className="min-w-0">
        <p className="text-[17px] tracking-tight text-white">{label}</p>
        {hint ? <p className="text-[12px] text-white/35">{hint}</p> : null}
      </div>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={decreaseLabel}
          disabled={value <= min}
          className={cn(
            "size-9 rounded-full bg-white/8 text-white hover:bg-white/14",
            "disabled:opacity-25"
          )}
          onPointerDown={(event) => {
            event.preventDefault()
            setDraft(null)
            hold(-1)
          }}
          onPointerUp={clearHold}
          onPointerLeave={clearHold}
          onPointerCancel={clearHold}
          onContextMenu={(event) => event.preventDefault()}
        >
          <Minus />
        </Button>
        <div className="flex min-w-[3.75rem] items-baseline justify-center">
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            aria-label={label}
            value={shown}
            className={cn(
              "w-[2.75rem] bg-transparent text-center text-[17px] font-medium",
              "text-white tabular-nums tracking-tight outline-none select-text",
              "caret-white"
            )}
            onChange={(event) => {
              const raw = event.target.value.replace(/[^\d]/g, "")
              setDraft(raw)
              if (raw === "") return
              commit(Number(raw))
            }}
            onBlur={() => {
              if (draft === "" || draft === null) {
                setDraft(null)
                return
              }
              commit(Number(draft))
              setDraft(null)
            }}
            onFocus={(event) => {
              setDraft(String(value))
              event.target.select()
            }}
          />
          {suffix ? (
            <span className="text-[13px] font-normal text-white/40">{suffix}</span>
          ) : null}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={increaseLabel}
          disabled={value >= max}
          className={cn(
            "size-9 rounded-full bg-white/8 text-white hover:bg-white/14",
            "disabled:opacity-25"
          )}
          onPointerDown={(event) => {
            event.preventDefault()
            setDraft(null)
            hold(1)
          }}
          onPointerUp={clearHold}
          onPointerLeave={clearHold}
          onPointerCancel={clearHold}
          onContextMenu={(event) => event.preventDefault()}
        >
          <Plus />
        </Button>
      </div>
    </div>
  )
}
