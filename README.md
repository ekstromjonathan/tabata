# Tabata

Minimal tabata-timer som produkt: **19 kr per måned per bruker**.

Nettapp, **App Store** og **Google Play**. I butikk-appene går betaling via Apple og Google (påkrevd). På nett via Stripe.

Organisk spredning uten annonsebudsjett: [docs/MARKEDSFORING.md](docs/MARKEDSFORING.md).

## Kjør lokalt

```bash
npm install
npm run dev
```

Åpne [http://127.0.0.1:43173](http://127.0.0.1:43173). Timeren uten konto: [http://127.0.0.1:43173/tabata](http://127.0.0.1:43173/tabata). Agent-API: [docs/API.md](docs/API.md).

Uten Stripe-nøkler: opprett konto og trykk **Aktiver i utviklingsmodus**.

## Last ned som app (App Store og Google Play)

Native-skallet er Capacitor. Appen laster den kjørende nettappen i en WebView og tar betalt med **in-app purchase** (`tabata_monthly`).

1. Deploy nettappen (Vercel eller annen Node-vert) og sett `APP_URL` til den offentlige HTTPS-adressen.
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
