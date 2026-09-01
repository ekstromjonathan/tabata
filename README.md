# Tabata

Minimal tabata-timer som produkt: **19 kr per måned per bruker**.

Nettapp du legger på hjemskjermen. Kortbetaling via Stripe. Ingen App Store-avgift.

## Slik tjener du penger

1. **Selg som nettapp**, ikke gjennom App Store. 19 kr/mnd tåler ikke 15–30 % Apple-kutt pluss gjennomgang.
2. **Stripe** tar betalt hver måned (kort, Apple Pay, Google Pay). Du får utbetaling til bankkonto.
3. **Kunde** oppretter konto → betaler 19 kr/mnd → åpner timeren. Oppsigelse i kontoen.
4. **Selskap**: ENK eller AS. Avklar MVA (digitale tjenester i Norge er ofte 25 %). Sett prisen som 19 kr inkl. mva hvis du er MVA-pliktig, eller sjekk med regnskap.
5. **Legg ut**: Vercel eller lignende. Pek et domene (f.eks. `tabata.app`) mot appen.

Lokalt uten Stripe-nøkler: opprett konto og trykk **Aktiver i utviklingsmodus**. Da får du full timer uten kort.

## Kjør lokalt

```bash
npm install
npm run dev
```

Åpne [http://127.0.0.1:43173](http://127.0.0.1:43173).

## Stripe (produksjon)

1. Lag konto på [stripe.com](https://stripe.com).
2. Opprett produkt **Tabata**, pris **19 NOK**, gjentakende **månedlig**.
3. Kopier pris-ID (`price_...`) og nøkler til `.env`:

```bash
cp .env.example .env
```

```
AUTH_SECRET=et-langt-tilfeldig-passord
APP_URL=https://ditt-domene.no
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

4. Webhook-endepunkt: `https://ditt-domene.no/api/stripe/webhook`  
   Hendelser: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.
5. Deploy til Vercel. Sett samme miljøvariabler der.  
   For flere maskiner, bruk Turso/LibSQL og sett `DATABASE_URL`.

Testkort i Stripe testmodus: `4242 4242 4242 4242`.

## Timeren

Arbeid, hvile, øvelser, runder og pause mellom runder. Pip og nedtelling. Norsk, svensk og engelsk.
