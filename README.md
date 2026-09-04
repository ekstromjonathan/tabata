# Tabata

Minimal tabata-timer som produkt: **19 kr per måned per bruker**.

Nettapp, **App Store** og **Google Play**. I butikk-appene går betaling via Apple og Google (påkrevd). På nett via Stripe.

Organisk spredning uten annonsebudsjett: [docs/MARKEDSFORING.md](docs/MARKEDSFORING.md).

## Kjør lokalt

```bash
npm install
npm run dev
```

Åpne [http://127.0.0.1:43173](http://127.0.0.1:43173). Timeren uten konto: [http://127.0.0.1:43173/tabata](http://127.0.0.1:43173/tabata).

Uten Stripe-nøkler: opprett konto og trykk **Aktiver i utviklingsmodus**.

## Last ned som app (App Store og Google Play)

Native-skallet er Capacitor. Appen laster den kjørende nettappen i en WebView og tar betalt med **in-app purchase** (`tabata_monthly`).

1. Deploy nettappen (Cloudflare Worker via OpenNext, se under) og sett `APP_URL` til den offentlige HTTPS-adressen.
2. Opprett abonnementet i App Store Connect og Google Play Console. Se [docs/APP_STORES.md](docs/APP_STORES.md).
3. På en Mac med Xcode / en maskin med Android Studio:

```bash
cp .env.example .env.local
# sett APP_URL til produksjon
npx cap sync
npx cap open ios      # Arkiver og last opp med Xcode
npx cap open android  # Bygg AAB og last opp i Play Console
```

iOS-prosjektet genereres på Mac (`npx cap add ios` hvis `ios/` mangler). Android-prosjektet ligger i `android/`.

## Deploy på Cloudflare

Appen er Next.js App Router med serverruter (`app/api`) og innlogging, så statisk `output: 'export'` / Cloudflare Pages med `out/` virker ikke.

Offisiell sti for dette er **OpenNext på Workers** (`@opennextjs/cloudflare`). Worker-navnet er `tabata` (matcher Cloudflare-prosjektet). Det eksisterende Pages-prosjektet `tabata` (`tabata-63x.pages.dev`) er satt opp som statisk eksport og kan ikke kjøre denne appen.

```bash
npm install
npm run build      # Next.js-bygg (også kalt av OpenNext)
npm run preview    # Bygg og kjør lokalt i Workers-runtime
npm run deploy     # Bygg og deploy Worker `tabata`
```

Cloudflare Workers Builds: byggkommando `npx opennextjs-cloudflare build` (eller `npm run cf:build`). Deploy leser `wrangler.jsonc`. `npm run deploy` sender `--keep-vars` slik at hemmeligheter i dashbordet ikke overskrives.

### Miljøvariabler i Cloudflare-dashbordet

Sett både **runtime** (Settings → Variables and Secrets) og **build** variables/secrets:

| Variabel | Påkrevd | Merknad |
| --- | --- | --- |
| `AUTH_SECRET` | Ja | Lang tilfeldig streng |
| `APP_URL` | Ja | Offentlig HTTPS-origin, f.eks. `https://tabata.<konto>.workers.dev` |
| `DATABASE_URL` | Ja | Remote Turso/libSQL, f.eks. `libsql://....turso.io`. Ikke `file:` |
| `DATABASE_AUTH_TOKEN` | Ja | Turso/libSQL auth token |
| `STRIPE_SECRET_KEY` | Nei | Uten Stripe: utviklingsopplåsing (ikke i produksjon) |
| `STRIPE_PRICE_ID` | Nei | |
| `STRIPE_WEBHOOK_SECRET` | Nei | Webhook: `https://<origin>/api/stripe/webhook` |
| `APPLE_SHARED_SECRET` | Nei | iOS-kvittering |
| `CAPACITOR_SERVER_URL` | Nei | Overstyr WebView-URL ved native sync |

Lokalt: `file:data/tabata.db` (standard i `.env.example`). På Workers finnes ikke filsystemet, så bruk [Turso](https://turso.tech/) eller annen hosted libSQL.

## Stripe (kun nett)

1. Lag konto på [stripe.com](https://stripe.com).
2. Produkt **Tabata**, pris **19 NOK**, månedlig.
3. Kopier nøkler til `.env.local`:

```
AUTH_SECRET=et-langt-tilfeldig-passord
APP_URL=https://ditt-domene.no
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

4. Webhook: `https://ditt-domene.no/api/stripe/webhook`  
   Hendelser: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.

Apple avviser Stripe for digitale abonnementer **inne i iOS-appen**. Native-appen bruker derfor App Store / Google Play.

## Timeren

Arbeid, hvile, øvelser, runder og pause mellom runder. Pip og nedtelling. Norsk, svensk og engelsk.
