import { cn } from "@/lib/utils"

type CountRingProps = {
  current: number
  total: number
  label: string
  color: string
}

export function CountRing({ current, total, label, color }: CountRingProps) {
  const size = 88
  const stroke = 3.5
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const progress = total <= 0 ? 0 : Math.min(1, current / total)
  const offset = circumference * (1 - progress)

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative size-[4.35rem] sm:size-[5.25rem]">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="h-full w-full -rotate-90"
          aria-hidden="true"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <p
          className={cn(
            "absolute inset-0 flex items-center justify-center",
            "font-medium tracking-tight text-white tabular-nums",
            "text-[17px] sm:text-[19px]"
          )}
        >
          {current}
          <span className="text-[13px] text-white/35 sm:text-[14px]">
            /{total}
          </span>
        </p>
      </div>
      <p className="text-[10px] font-medium tracking-[0.18em] text-white/35 uppercase sm:text-[11px]">
        {label}
      </p>
    </div>
  )
}
