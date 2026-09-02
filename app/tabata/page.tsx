import type { Metadata } from "next"

import { TabataTimer } from "@/components/tabata-timer"

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

export default function PublicTabataPage() {
  return <TabataTimer guest />
}
