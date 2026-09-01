import Link from "next/link"

import { SiteHeader } from "@/components/site-header"

export default function TermsPage() {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-md px-6 py-8">
      <SiteHeader />
      <h1 className="mt-10 text-[28px] font-semibold tracking-tight">Vilkår</h1>
      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-white/60">
        <p>
          Tabata koster 19 kroner per måned per bruker. Abonnementet fornyes
          automatisk til du sier det opp.
        </p>
        <p>
          Du avslutter i kontoen (Stripe kundeportal når Stripe er satt opp).
          Tilgangen varer ut perioden du allerede har betalt for.
        </p>
        <p>
          Tjenesten er en nettapp. Du kan legge den på hjemskjermen. Det er
          ikke en App Store-app.
        </p>
      </div>
      <Link href="/" className="mt-10 inline-block text-[14px] text-white/40">
        Tilbake
      </Link>
    </div>
  )
}
