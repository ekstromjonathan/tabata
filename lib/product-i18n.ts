import type { Locale } from "@/lib/i18n"

export type ProductCopy = {
  product: string
  tagline: string
  pitch: string
  cta: string
  login: string
  signup: string
  logout: string
  account: string
  price: string
  priceNote: string
  feature1: string
  feature2: string
  feature3: string
  feature4: string
  email: string
  password: string
  haveAccount: string
  needAccount: string
  subscribeTitle: string
  subscribeBody: string
  pay: string
  mockPay: string
  mockNote: string
  manageBilling: string
  status: string
  active: string
  inactive: string
  openTimer: string
  privacy: string
  terms: string
  footer: string
}

export const PRODUCT: Record<Locale, ProductCopy> = {
  nb: {
    product: "Tabata",
    tagline: "Treningen, uten støy.",
    pitch:
      "En minimal tabata-timer til telefonen og maskinen. Store tall, behagelige pip, runder og øvelser.",
    cta: "Start for 19 kr/mnd",
    login: "Logg inn",
    signup: "Opprett konto",
    logout: "Logg ut",
    account: "Konto",
    price: "19 kr",
    priceNote: "per måned, per bruker. Avslutt når som helst.",
    feature1: "Arbeid, hvile, øvelser og runder",
    feature2: "Pip og nedtelling de siste fem sekundene",
    feature3: "Norsk, svensk og engelsk",
    feature4: "Legg på hjemskjermen som en app",
    email: "E-post",
    password: "Passord",
    haveAccount: "Har du allerede konto?",
    needAccount: "Ny her?",
    subscribeTitle: "Ett abonnement. Hele timeren.",
    subscribeBody:
      "19 kroner i måneden. Kort, Apple Pay eller Google Pay via Stripe. Du kan si opp i kontoen.",
    pay: "Betal 19 kr/mnd",
    mockPay: "Aktiver i utviklingsmodus",
    mockNote:
      "Stripe er ikke satt opp ennå. Lokalt får du tilgang med en gang, uten kort.",
    manageBilling: "Administrer abonnement",
    status: "Status",
    active: "Aktiv",
    inactive: "Ikke betalt",
    openTimer: "Åpne timeren",
    privacy: "Personvern",
    terms: "Vilkår",
    footer: "19 kr/mnd. Ingen bindingstid.",
  },
  sv: {
    product: "Tabata",
    tagline: "Träningen, utan brus.",
    pitch:
      "En minimal tabata-timer till telefonen och datorn. Stora siffror, mjuka pip, rundor och övningar.",
    cta: "Börja för 19 kr/mån",
    login: "Logga in",
    signup: "Skapa konto",
    logout: "Logga ut",
    account: "Konto",
    price: "19 kr",
    priceNote: "per månad, per användare. Avsluta när du vill.",
    feature1: "Arbete, vila, övningar och rundor",
    feature2: "Pip och nedräkning de sista fem sekunderna",
    feature3: "Norska, svenska och engelska",
    feature4: "Lägg på hemskärmen som en app",
    email: "E-post",
    password: "Lösenord",
    haveAccount: "Har du redan ett konto?",
    needAccount: "Ny här?",
    subscribeTitle: "En prenumeration. Hela timern.",
    subscribeBody:
      "19 kronor i månaden. Kort via Stripe. Du kan säga upp i kontot.",
    pay: "Betala 19 kr/mån",
    mockPay: "Aktivera i utvecklingsläge",
    mockNote:
      "Stripe är inte konfigurerat ännu. Lokalt får du tillgång direkt, utan kort.",
    manageBilling: "Hantera prenumeration",
    status: "Status",
    active: "Aktiv",
    inactive: "Inte betald",
    openTimer: "Öppna timern",
    privacy: "Integritet",
    terms: "Villkor",
    footer: "19 kr/mån. Ingen bindningstid.",
  },
  en: {
    product: "Tabata",
    tagline: "Training, without the noise.",
    pitch:
      "A minimal tabata timer for phone and desktop. Large numbers, soft beeps, rounds and exercises.",
    cta: "Start for 19 NOK/month",
    login: "Log in",
    signup: "Create account",
    logout: "Log out",
    account: "Account",
    price: "19 NOK",
    priceNote: "per month, per person. Cancel anytime.",
    feature1: "Work, rest, exercises and rounds",
    feature2: "Beeps and a countdown on the last five seconds",
    feature3: "Norwegian, Swedish and English",
    feature4: "Add to your home screen as an app",
    email: "Email",
    password: "Password",
    haveAccount: "Already have an account?",
    needAccount: "New here?",
    subscribeTitle: "One subscription. The full timer.",
    subscribeBody:
      "19 NOK a month. Card, Apple Pay or Google Pay via Stripe. Cancel in account.",
    pay: "Pay 19 NOK/month",
    mockPay: "Activate in development mode",
    mockNote:
      "Stripe is not configured yet. Locally you get access immediately, no card.",
    manageBilling: "Manage subscription",
    status: "Status",
    active: "Active",
    inactive: "Not paid",
    openTimer: "Open timer",
    privacy: "Privacy",
    terms: "Terms",
    footer: "19 NOK/month. No lock-in.",
  },
}
