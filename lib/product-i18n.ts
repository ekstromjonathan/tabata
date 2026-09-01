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
  nativeSubscribeBody: string
  pay: string
  mockPay: string
  mockNote: string
  manageBilling: string
  manageStore: string
  status: string
  active: string
  inactive: string
  openTimer: string
  privacy: string
  terms: string
  footer: string
  restore: string
  restoreOk: string
  restoreNone: string
  deleteAccount: string
  deleteForever: string
  appleLegal: string
  loadingPrice: string
  storeUnavailable: string
  iapError: string
  working: string
  downloadStores: string
}

export const PRODUCT: Record<Locale, ProductCopy> = {
  nb: {
    product: "Tabata",
    tagline: "Treningen, uten støy.",
    pitch:
      "En minimal tabata-timer til telefonen. Store tall, behagelige pip, runder og øvelser. Last ned i App Store og Google Play.",
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
    feature4: "App Store og Google Play",
    email: "E-post",
    password: "Passord",
    haveAccount: "Har du allerede konto?",
    needAccount: "Ny her?",
    subscribeTitle: "Ett abonnement. Hele timeren.",
    subscribeBody:
      "19 kroner i måneden. På nett: kort, Apple Pay eller Google Pay via Stripe. I appen: App Store eller Google Play.",
    nativeSubscribeBody:
      "19 kroner i måneden via App Store eller Google Play. Du kan gjenopprette kjøp og si opp i butikkinnstillingene.",
    pay: "Betal 19 kr/mnd",
    mockPay: "Aktiver i utviklingsmodus",
    mockNote:
      "Stripe er ikke satt opp ennå. Lokalt får du tilgang med en gang, uten kort.",
    manageBilling: "Administrer abonnement",
    manageStore: "Administrer i butikken",
    status: "Status",
    active: "Aktiv",
    inactive: "Ikke betalt",
    openTimer: "Åpne timeren",
    privacy: "Personvern",
    terms: "Vilkår",
    footer: "19 kr/mnd. Ingen bindingstid.",
    restore: "Gjenopprett kjøp",
    restoreOk: "Kjøpet er gjenopprettet.",
    restoreNone: "Fant ingen aktive kjøp på denne kontoen.",
    deleteAccount: "Slett konto",
    deleteForever: "Bekreft sletting av konto",
    appleLegal:
      "Betalingen belastes Apple-ID eller Google-kontoen din ved bekreftelse. Abonnementet fornyes automatisk med mindre du sier det opp minst 24 timer før perioden utløper. Du administrerer det i butikkinnstillingene.",
    loadingPrice: "Henter pris…",
    storeUnavailable:
      "Butikken er ikke tilgjengelig her. Bygg appen med Xcode eller Android Studio og et ekte produkt-ID.",
    iapError: "Kjøpet feilet. Prøv igjen, eller gjenopprett kjøp.",
    working: "Vent…",
    downloadStores: "Last ned i App Store og Google Play.",
  },
  sv: {
    product: "Tabata",
    tagline: "Träningen, utan brus.",
    pitch:
      "En minimal tabata-timer till telefonen. Stora siffror, mjuka pip, rundor och övningar. Ladda ner i App Store och Google Play.",
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
    feature4: "App Store och Google Play",
    email: "E-post",
    password: "Lösenord",
    haveAccount: "Har du redan ett konto?",
    needAccount: "Ny här?",
    subscribeTitle: "En prenumeration. Hela timern.",
    subscribeBody:
      "19 kronor i månaden. På webben: kort via Stripe. I appen: App Store eller Google Play.",
    nativeSubscribeBody:
      "19 kronor i månaden via App Store eller Google Play. Du kan återställa köp och säga upp i butiksinställningarna.",
    pay: "Betala 19 kr/mån",
    mockPay: "Aktivera i utvecklingsläge",
    mockNote:
      "Stripe är inte konfigurerat ännu. Lokalt får du tillgång direkt, utan kort.",
    manageBilling: "Hantera prenumeration",
    manageStore: "Hantera i butiken",
    status: "Status",
    active: "Aktiv",
    inactive: "Inte betald",
    openTimer: "Öppna timern",
    privacy: "Integritet",
    terms: "Villkor",
    footer: "19 kr/mån. Ingen bindningstid.",
    restore: "Återställ köp",
    restoreOk: "Köpet är återställt.",
    restoreNone: "Inga aktiva köp hittades på det här kontot.",
    deleteAccount: "Radera konto",
    deleteForever: "Bekräfta radering av konto",
    appleLegal:
      "Betalningen debiteras ditt Apple-ID eller Google-konto vid bekräftelse. Prenumerationen förnyas automatiskt om du inte säger upp den minst 24 timmar innan perioden tar slut. Du hanterar den i butiksinställningarna.",
    loadingPrice: "Hämtar pris…",
    storeUnavailable:
      "Butiken är inte tillgänglig här. Bygg appen med Xcode eller Android Studio och ett riktigt produkt-ID.",
    iapError: "Köpet misslyckades. Försök igen eller återställ köp.",
    working: "Vänta…",
    downloadStores: "Ladda ner i App Store och Google Play.",
  },
  en: {
    product: "Tabata",
    tagline: "Training, without the noise.",
    pitch:
      "A minimal tabata timer for your phone. Large numbers, soft beeps, rounds and exercises. Download it on the App Store and Google Play.",
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
    feature4: "App Store and Google Play",
    email: "Email",
    password: "Password",
    haveAccount: "Already have an account?",
    needAccount: "New here?",
    subscribeTitle: "One subscription. The full timer.",
    subscribeBody:
      "19 NOK a month. On the web: card via Stripe. In the app: App Store or Google Play.",
    nativeSubscribeBody:
      "19 NOK a month through the App Store or Google Play. Restore purchases and cancel in your store settings.",
    pay: "Pay 19 NOK/month",
    mockPay: "Activate in development mode",
    mockNote:
      "Stripe is not configured yet. Locally you get access immediately, no card.",
    manageBilling: "Manage subscription",
    manageStore: "Manage in the store",
    status: "Status",
    active: "Active",
    inactive: "Not paid",
    openTimer: "Open timer",
    privacy: "Privacy",
    terms: "Terms",
    footer: "19 NOK/month. No lock-in.",
    restore: "Restore purchases",
    restoreOk: "Purchase restored.",
    restoreNone: "No active purchases found on this account.",
    deleteAccount: "Delete account",
    deleteForever: "Confirm account deletion",
    appleLegal:
      "Payment is charged to your Apple ID or Google account at confirmation. The subscription renews automatically unless you cancel at least 24 hours before the period ends. Manage it in your store account settings.",
    loadingPrice: "Loading price…",
    storeUnavailable:
      "The store is not available here. Build with Xcode or Android Studio and a real product ID.",
    iapError: "Purchase failed. Try again, or restore purchases.",
    working: "Please wait…",
    downloadStores: "Download on the App Store and Google Play.",
  },
}
