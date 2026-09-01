import Link from "next/link"

import { SiteHeader } from "@/components/site-header"

export default function PrivacyPage() {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-md px-6 py-8">
      <SiteHeader />
      <h1 className="mt-10 text-[28px] font-semibold tracking-tight">Personvern</h1>
      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-white/60">
        <p>
          Tabata lagrer e-posten din og om abonnementet er aktivt. Passord lagres
          som hash, ikke i klartekst.
        </p>
        <p>
          Betaling går via Stripe. Vi lagrer Stripe-kunde- og abonnements-ID for
          å holde tilgangen oppdatert. Vi selger ikke data.
        </p>
        <p>
          Du kan be om sletting av kontoen ved å sende e-post til den adressen
          du bruker på Stripe-kontoen din.
        </p>
      </div>
      <Link href="/" className="mt-10 inline-block text-[14px] text-white/40">
        Tilbake
      </Link>
    </div>
  )
}
