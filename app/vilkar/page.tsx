import Link from "next/link"

import { SiteHeader } from "@/components/site-header"

export default function TermsPage() {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-md px-6 py-8 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
      <SiteHeader />
      <h1 className="mt-10 text-[28px] font-semibold tracking-tight">Vilkår</h1>
      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-ink-muted">
        <p>
          Tabata koster 19 kroner per måned per bruker. Abonnementet fornyes
          automatisk til du sier det opp.
        </p>
        <p>
          På nett avslutter du i kontoen (Stripe-kundeportal når Stripe er satt
          opp). I iOS-appen administrerer du abonnementet i Apple-ID-innstillingene.
          I Android-appen administrerer du det i Google Play. Tilgangen varer ut
          perioden du allerede har betalt for.
        </p>
        <p>
          Betaling i appen belastes Apple-ID eller Google-kontoen din ved
          bekreftelse av kjøp. Abonnementet fornyes automatisk med mindre det
          sies opp minst 24 timer før slutten av gjeldende periode. Kontoen
          belastes fornyelse innen 24 timer før perioden utløper.
        </p>
        <p>
          Du kan slette kontoen under Konto. Det avslutter ikke automatisk et
          butikkabonnement; det må sies opp i App Store eller Google Play.
        </p>
      </div>
      <Link href="/" className="mt-10 inline-block text-[14px] text-ink-muted">
        Tilbake
      </Link>
    </div>
  )
}
