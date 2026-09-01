import { cn } from "@/lib/utils"

type IconProps = {
  className?: string
}

export function SunIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn("size-3.5", className)}
    >
      <circle
        cx="12"
        cy="12"
        r="4"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M12 3.25v2.1M12 18.65v2.1M3.25 12h2.1M18.65 12h2.1M6.05 6.05l1.48 1.48M16.47 16.47l1.48 1.48M17.95 6.05l-1.48 1.48M7.53 16.47l-1.48 1.48"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function MoonIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn("size-3.5", className)}
    >
      <path
        d="M15.2 4.15A7.7 7.7 0 1 0 19.85 15.2 6.35 6.35 0 0 1 15.2 4.15Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function CustomThemeIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn("size-3.5", className)}
    >
      <circle
        cx="12"
        cy="12"
        r="8"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <circle cx="12" cy="12" r="3.25" fill="currentColor" />
    </svg>
  )
}
