import type { Metadata } from "next"

import { TabataTimer } from "@/components/tabata-timer"
import { flattenSearchParams, parseSessionInput } from "@/lib/session"
import { DEFAULT_SETTINGS } from "@/lib/workout"

export const metadata: Metadata = {
  title: "Simple Tabata timer",
  description:
    "Enkel tabata-timer i nettleseren. 20 sekunder arbeid, 10 hvile. Ingen konto. Start med en gang.",
  keywords: [
    "simple tabata",
    "simple tabata timer",
    "tabata timer",
    "enkel tabata",
    "hiit timer",
    "intervalltimer",
  ],
  alternates: {
    canonical: "/tabata",
  },
}

export default async function PublicTabataPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const raw = flattenSearchParams(await searchParams)
  const parsed = parseSessionInput(raw, {
    strict: false,
    base: DEFAULT_SETTINGS,
  })
  return <TabataTimer guest query={parsed.ok ? parsed.query : undefined} />
}
