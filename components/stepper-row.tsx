"use client"

import { useRef } from "react"
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
  onChange: (value: number) => void
}

export function StepperRow({
  label,
  hint,
  value,
  suffix = "",
  min,
  max,
  onChange,
}: StepperRowProps) {
  const delayRef = useRef<number | null>(null)
  const intervalRef = useRef<number | null>(null)

  function clearHold() {
    if (delayRef.current) window.clearTimeout(delayRef.current)
    if (intervalRef.current) window.clearInterval(intervalRef.current)
    delayRef.current = null
    intervalRef.current = null
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

  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5">
      <div className="min-w-0">
        <p className="text-[17px] tracking-tight text-white">{label}</p>
        {hint ? <p className="text-[12px] text-white/35">{hint}</p> : null}
      </div>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Reduser ${label.toLowerCase()}`}
          disabled={value <= min}
          className={cn(
            "size-9 rounded-full bg-white/8 text-white hover:bg-white/14",
            "disabled:opacity-25"
          )}
          onPointerDown={(event) => {
            event.preventDefault()
            hold(-1)
          }}
          onPointerUp={clearHold}
          onPointerLeave={clearHold}
          onPointerCancel={clearHold}
          onContextMenu={(event) => event.preventDefault()}
        >
          <Minus />
        </Button>
        <div className="w-14 text-center font-medium tabular-nums tracking-tight text-white">
          {value}
          {suffix ? (
            <span className="ml-0.5 text-[13px] font-normal text-white/40">
              {suffix}
            </span>
          ) : null}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Øk ${label.toLowerCase()}`}
          disabled={value >= max}
          className={cn(
            "size-9 rounded-full bg-white/8 text-white hover:bg-white/14",
            "disabled:opacity-25"
          )}
          onPointerDown={(event) => {
            event.preventDefault()
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
