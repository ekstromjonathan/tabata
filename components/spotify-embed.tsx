"use client"

import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"
import type { SpotifyRef } from "@/lib/spotify"

export function SpotifyEmbed({
  spotify,
  musicLabel,
  openLabel,
  collapsed,
}: {
  spotify: SpotifyRef
  musicLabel: string
  openLabel: string
  collapsed?: boolean
}) {
  const detailsRef = useRef<HTMLDetailsElement>(null)

  useEffect(() => {
    if (!detailsRef.current) return
    detailsRef.current.open = !collapsed
  }, [collapsed])

  return (
    <details ref={detailsRef} className="w-full rounded-[18px] bg-fill">
      <summary className="cursor-pointer px-4 py-2.5 text-[13px] font-medium tracking-[0.06em] text-ink-muted uppercase">
        {musicLabel}
      </summary>
      <div className="px-2 pb-2">
        <iframe
          title={musicLabel}
          src={`${spotify.embedUrl}?utm_source=generator&theme=0`}
          width="100%"
          height="152"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="block w-full rounded-xl border-0 bg-black"
        />
        <a
          href={spotify.openUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "mt-1.5 inline-flex h-9 items-center px-2 text-[13px] text-ink-muted",
            "hover:text-ink"
          )}
        >
          {openLabel}
        </a>
      </div>
    </details>
  )
}
